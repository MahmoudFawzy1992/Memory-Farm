import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
  const { user } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-purple-200 text-purple-800"
        : "text-purple-600 hover:bg-purple-100 hover:text-purple-800"
    }`;

  return (
    <nav className="bg-purple-50 border-b border-purple-200 py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* 🌸 Logo / Brand */}
        <h1 className="text-xl font-bold text-purple-700 font-serif">
          <NavLink to="/" className="hover:opacity-80 transition-opacity duration-200">
            🌸 Memory Farm
          </NavLink>
        </h1>

        {/* 🔗 Navigation Links */}
        <div className="flex gap-4 items-center">
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
              <ProfileMenu />
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                🔐 Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                ✍️ Signup
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
