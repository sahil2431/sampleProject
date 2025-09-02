import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

interface Comment {
  authorName : string;
  text: string;
}

interface Reaction {
  type: "up" | "down" | "heart";
  userId: string;
}
interface Announcement {
  id: number;
  title: string;
  description?: string;
  status: string;
  comments?: Comment[];
  reactions?: Reaction[];
  createdAt: string;

}

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const [commentLimit, setCommentLimit] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
const [commentCursor, setCommentCursor] = useState<string | null>(null);
const [loadingComments, setLoadingComments] = useState(false);
const [authorName, setAuthorName] = useState("");

const userId = "user-123"; // This should come from your auth context or similar


  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/announcements");
      if (response.status !== 200)
        throw new Error("Failed to fetch announcements");
      setAnnouncements(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReaction = async (announcementId: number, type: "up" | "down" | "heart") => {
    try {
      await axiosInstance.post(
        `/announcements/${announcementId}/reactions`,
        { type , userId },
        { headers: { "Idempotency-Key": `${userId}-${type}` } }
      );
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveReaction = async (announcementId: number) => {
    try {
      const react = await axiosInstance.delete(`/announcements/${announcementId}/reactions`, {
        headers: { "x-user-id": userId }
      });
      console.log(react);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchComments = async (announcementId: number) => {
  try {
    setLoadingComments(true);
    const response = await axiosInstance.get(`/announcements/${announcementId}/comments`, {
      params: {
        limit: commentLimit,
        cursor: commentCursor
      }
    });
    
    if (response.status !== 200) {
      throw new Error("Failed to fetch comments");
    }
    
    // Update the comments in the announcement
    setAnnouncements(prev => prev.map(announcement => {
      if (announcement.id === announcementId) {
        return {
          ...announcement,
          comments: commentCursor 
            ? [...(announcement.comments || []), ...response.data]
            : response.data
        };
      }
      return announcement;
    }));

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoadingComments(false);
  }
};

  //handle add comment
  const handleAddComment = async (announcementId: number) => {
  if (!comment.trim() || !authorName.trim()) {
    setError("Both author name and comment are required");
    return;
  }

  try {
    setError(null);
    const response = await axiosInstance.post(`/announcements/${announcementId}/comments`, {
      authorName,
      text: comment
    });
    
    if (response.status !== 201) {
      throw new Error("Failed to add comment");
    }

    setComment("");
    setAuthorName("");
    // Refresh comments for this announcement
    setCommentCursor(null); // Reset cursor
    fetchComments(announcementId);
  } catch (err: any) {
    setError(err.message);
  }
};

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      setError(null);
      const response = await axiosInstance.post("/announcements", {
        title,
        description,
      });
      if (response.status !== 201)
        throw new Error("Failed to create announcement");

      setTitle("");
      setDescription("");
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    filter === "all" ? true : a.status === filter
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded-2xl shadow"
      >
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Add Announcement
        </button>
      </form>

      <div className="flex space-x-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg border ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg border ${
            filter === "active" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 rounded-lg border ${
            filter === "closed" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Closed
        </button>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchAnnouncements}
        className="w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-100"
      >
        Refresh
      </button>

      <div className="space-y-4">
        {loading && <p>Loading...</p>}
        {!loading && filteredAnnouncements.length === 0 && (
          <p>No announcements found.</p>
        )}
        {filteredAnnouncements.map((a) => (
          <div key={a.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{a.title}</h2>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  a.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {a.status}
              </span>
            </div>
            
            {a.description && (
              <p className="text-gray-600 mt-1">{a.description}</p>
            )}
            
            <p className="text-gray-400 text-xs mt-2">
              Created At: {new Date(a.createdAt).toLocaleString()}
            </p>

            {/* Reactions */
            <div className="mt-3 flex gap-3 items-center">
              <button onClick={() => handleAddReaction(a.id, "up")} className="text-blue-600 text-lg cursor-pointer">👍</button>
              <button onClick={() => handleAddReaction(a.id, "down")} className="text-red-600 text-lg cursor-pointer">👎</button>
              <button onClick={() => handleAddReaction(a.id, "heart")} className="text-pink-600 text-lg cursor-pointer">❤️</button>
              <button onClick={() => handleRemoveReaction(a.id)} className="text-gray-500 text-lg cursor-pointer">Remove</button>
              <span className="text-xs text-gray-500">
                {a.reactions ? `${a.reactions.length} reactions` : "0 reactions"}
              </span>
            </div>}

            {/* Comments Section */}
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Comments</h3>
              
              {/* Display Comments */}
              <div className="space-y-2 mb-4">
                {a.comments?.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                    <p className="font-semibold">{comment?.authorName}</p>
                    <p>{comment?.text}</p>
                  </div>
                ))}
                {loadingComments && <p className="text-sm text-gray-500">Loading comments...</p>}
                {a.comments && a.comments.length >= commentLimit && (
                  <button
                    onClick={() => {
                      if (a.comments && a.comments.length > 0) {
                        setCommentCursor(a.comments[a.comments.length - 1].authorName);
                        fetchComments(a.id);
                      }
                    }}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Load more comments
                  </button>
                )}
              </div>

              {/* Comment Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedAnnouncementId === a.id ? authorName : ""}
                    onChange={(e) => {
                      setSelectedAnnouncementId(a.id);
                      setAuthorName(e.target.value);
                    }}
                    placeholder="Your name..."
                    className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedAnnouncementId === a.id ? comment : ""}
                    onChange={(e) => {
                      setSelectedAnnouncementId(a.id);
                      setComment(e.target.value);
                    }}
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddComment(a.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
