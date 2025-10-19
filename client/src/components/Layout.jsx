// Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Layout() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const isAuthPage = [
    "/login",
    "/signup",
    "/verify-prompt",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={`${
          isAuthPage ? "bg-gray-50" : "bg-white"
        } border-t border-gray-200`}
      >
        <div className="container mx-auto px-4 py-10 flex flex-col items-center text-center space-y-6 md:space-y-8">
          {!isAuthPage ? (
            <>
              {/* Row 1 — Logo + tagline */}
              <div className="flex flex-col items-center space-y-3">
                <img
                  src="/Logo.png"
                  alt="Memory Farm"
                  className="h-24 w-auto sm:h-20 md:h-24 lg:h-28 object-contain"
                />
                <p className="text-base sm:text-lg text-gray-700 italic max-w-md md:max-w-xl">
                  Your memories deserve a home that understands you
                </p>
              </div>

              {/* Row 2 — Creator + copyright */}
              <div className="flex flex-col items-center space-y-2 text-sm text-gray-600">
                <p>
                  Made with <span className="text-red-500">❤️</span> by{" "}
                  <a
                    href="https://mahmoud-fawzy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 font-semibold hover:text-blue-600 transition-colors"
                  >
                    Mahmoud Fawzy
                  </a>
                </p>
                <p className="text-xs text-gray-500">
                  © {currentYear} Memory Farm. All rights reserved.{" "}
                  <Link
                    to="/privacy-policy"
                    className="hover:text-teal-600 transition-colors"
                  >
                    Privacy
                  </Link>
                </p>
              </div>
            </>
          ) : (
            // Minimal footer for auth pages
            <div className="text-center">
              <img
                src="/Logo.png"
                alt="Memory Farm"
                className="h-10 w-auto mx-auto mb-2"
              />
            </div>
          )}
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

export default Layout;
