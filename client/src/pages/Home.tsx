import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  const getRandomeMessage = async () => {
    const response = await axiosInstance.get("/random");
    if (response.status === 200) {
      setMessage(response.data);
    } else {
      setMessage("Error fetching message");
    }
  };
  useEffect(() => {
    const fetchMessage = async () => {
      const response = await axiosInstance.get("/");
      if (response.status === 200) {
        setMessage(response.data);
      } else {
        setMessage("Error fetching message");
      }
    };
    fetchMessage();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">NestJS + React</h1>
      <p className="text-xl text-gray-800">
        Message from backend:
        <span className="ml-2 font-semibold text-green-600">{message}</span>
      </p>
      <button
        onClick={getRandomeMessage}
        className="cursor-pointer ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg transition duration-300 mt-6 hover:scale-110"
      >
        Get random message
      </button>
    </div>
  );
};

export default Home;
