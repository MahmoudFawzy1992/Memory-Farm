import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  const toggle = () => setOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggle}
        className="text-sm font-semibold text-purple-700 hover:bg-purple-100 px-3 py-2 rounded-md"
      >
        👤 {user?.displayName || "Account"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white border border-purple-200 rounded-md shadow-md w-44 z-50">
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50"
            onClick={() => navigate("/dashboard")}
          >
            👤 My Profile
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50"
            onClick={() => navigate("/settings")}
          >
            ⚙️ Settings
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
