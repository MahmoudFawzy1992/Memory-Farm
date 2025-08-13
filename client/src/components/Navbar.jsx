import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-purple-200 text-purple-800"
        : "text-purple-600 hover:bg-purple-100 hover:text-purple-800"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-md text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-purple-200 text-purple-800"
        : "text-purple-600 hover:bg-purple-100 hover:text-purple-800"
    }`;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-purple-50 border-b border-purple-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 🌸 Logo / Brand */}
          <h1 className="text-xl font-bold text-purple-700 font-serif">
            <NavLink to="/" className="hover:opacity-80 transition-opacity duration-200">
              🌸 Memory Farm
            </NavLink>
          </h1>

          {/* 🖥️ Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            {user ? (
              <>
                <NavLink to="/" className={navLinkClass}>
                  🏠 Home
                </NavLink>
                <NavLink to="/discover" className={navLinkClass}>
                  🌍 Discover
                </NavLink>
                <NavLink to="/new" className={navLinkClass}>
                  📝 New Memory
                </NavLink>
                <NavLink to="/mood-tracker" className={navLinkClass}>
                  📊 Mood Tracker
                </NavLink>
                <ProfileMenu />
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-purple-600 hover:bg-purple-100 hover:text-purple-800 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  ✨ Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-purple-600 hover:bg-purple-100 hover:text-purple-800 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  🚀 How It Works
                </button>
                <button
                  onClick={() => scrollToSection('future')}
                  className="text-purple-600 hover:bg-purple-100 hover:text-purple-800 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  🔮 Future
                </button>
                <NavLink to="/login" className={navLinkClass}>
                  🔐 Login
                </NavLink>
                <NavLink to="/signup" className={navLinkClass}>
                  ✍️ Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* 📱 Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-purple-600 hover:bg-purple-100 transition-colors duration-200"
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

        {/* 📱 Mobile Navigation Menu */}
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
                <NavLink to="/discover" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  🌍 Discover
                </NavLink>
                <NavLink to="/new" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  📝 New Memory
                </NavLink>
                <NavLink to="/mood-tracker" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  📊 Mood Tracker
                </NavLink>
                <div className="px-4 py-3">
                  <ProfileMenu />
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-semibold text-purple-600 hover:bg-purple-100 hover:text-purple-800 transition-colors duration-200"
                >
                  ✨ Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-semibold text-purple-600 hover:bg-purple-100 hover:text-purple-800 transition-colors duration-200"
                >
                  🚀 How It Works
                </button>
                <button
                  onClick={() => scrollToSection('future')}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-semibold text-purple-600 hover:bg-purple-100 hover:text-purple-800 transition-colors duration-200"
                >
                  🔮 Future
                </button>
                <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  🔐 Login
                </NavLink>
                <NavLink to="/signup" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
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