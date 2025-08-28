import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

interface Announcement {
  id: number;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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

      {/* Announcements list */}
      <div className="space-y-4">
        {loading && <p>Loading...</p>}
        {!loading && filteredAnnouncements.length === 0 && (
          <p>No announcements found.</p>
        )}
        {filteredAnnouncements.map((a) => (
          <div key={a.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
              <h2 className="font-semibold text-lg">{a.id}</h2>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
