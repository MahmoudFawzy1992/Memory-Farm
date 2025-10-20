import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-md text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700"
    }`;

  const navigateToSection = (sectionId) => {
    if (location.pathname === '/') {
      // If already on home/landing page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to home with hash
      navigate(`/#${sectionId}`);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
              <img
                src="/Logo.png"
                alt="Memory Farm Logo"
                className="h-24 w-auto object-contain"
              />
              <span className="sr-only">Memory Farm</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            {user ? (
              <>
                <NavLink to="/" className={navLinkClass}>
                  🏠 Home
                </NavLink>
                <NavLink 
                  to="/discover" 
                  className={navLinkClass}
                  id="discover-link"
                >
                  🌍 Discover
                </NavLink>
                <NavLink to="/new" className={navLinkClass}>
                  📝 New Memory
                </NavLink>
                <NavLink 
                  to="/mood-tracker" 
                  className={navLinkClass}
                  id="mood-tracker-link"
                >
                  📊 Mood Tracker
                </NavLink>
                <ProfileMenu />
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateToSection('features')}
                  className="text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  ✨ Features
                </button>
                <button
                  onClick={() => navigateToSection('how-it-works')}
                  className="text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  🚀 How It Works
                </button>
                <button
                  onClick={() => navigateToSection('future')}
                  className="text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  🔮 Future
                </button>
                <NavLink to="/login" className={navLinkClass}>
                  🔐 Login
                </NavLink>
                <NavLink 
                  to="/signup" 
                  className="px-4 py-2 rounded-md text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  ✍️ Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-teal-600 hover:bg-teal-50 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="space-y-1">
            {user ? (
              <>
                <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  🏠 Home
                </NavLink>
                <NavLink 
                  to="/discover" 
                  className={mobileNavLinkClass} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  id="discover-link-mobile"
                >
                  🌍 Discover
                </NavLink>
                <NavLink to="/new" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  📝 New Memory
                </NavLink>
                <NavLink 
                  to="/mood-tracker" 
                  className={mobileNavLinkClass} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  id="mood-tracker-link-mobile"
                >
                  📊 Mood Tracker
                </NavLink>
                <div className="px-4 py-3">
                  <ProfileMenu />
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateToSection('features')}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-colors duration-200"
                >
                  ✨ Features
                </button>
                <button
                  onClick={() => navigateToSection('how-it-works')}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-colors duration-200"
                >
                  🚀 How It Works
                </button>
                <button
                  onClick={() => navigateToSection('future')}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-colors duration-200"
                >
                  🔮 Future
                </button>
                <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  🔐 Login
                </NavLink>
                <NavLink 
                  to="/signup" 
                  className="block px-4 py-3 rounded-md text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-md text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✍️ Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;