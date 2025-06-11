import React from "react";
import bgVideo from "../../assets/background.mp4";

const MainLayout = () => {
  return (
    <div id="root" className="relative w-full h-screen">
      <video
        autoPlay
        muted
        loop
        id="bg-video"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
        <h1 className="text-5xl font-bold mb-4">
          Stay informed, stay organized
        </h1>
        <p className="text-3xl font-light mb-8">
          Your personal reminder. A click away
        </p>

        <div className="space-x-4">
          <a
            href="/auth/google"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-medium shadow-lg transition duration-200"
          >
            Register
          </a>
          <a
            href="/auth/google"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-300 text-gray-900 rounded-md text-lg font-medium shadow-lg transition duration-200"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
