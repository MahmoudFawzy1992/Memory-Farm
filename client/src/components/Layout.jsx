// Layout.jsx
// Wraps the app with a global layout: Navigation at the top, main content in the center, and a footer below

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Reusing existing navigation component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-purple-50 to-white text-gray-800">
      {/* 🌸 Top Navigation */}
      <Navbar />

      {/* 🧠 Main content area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 🍃 Footer */}
      <footer className="bg-purple-100 text-center text-sm text-purple-600 py-4">
        Made with ❤️ by{" "}
        <a
          href="https://mahmoud-fawzy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 font-semibold hover:underline"
        >
          Mahmoud Fawzy
        </a>
      </footer>

      {/* 🔔 Global Toast Notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Layout;
