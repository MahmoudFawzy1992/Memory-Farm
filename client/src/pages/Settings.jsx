import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";
import ToggleSwitch from "../components/ToggleSwitch";
import DeleteAccountModal from "../components/DeleteAccountModal";
import FormInput from "../components/FormInput";
import ChangePasswordCard from "../components/ChangePasswordCard";

export default function Settings() {
  const { user, logout, updateProfile, deleteAccount } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [showFollowList, setShowFollowList] = useState(user?.showFollowList ?? true);

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({ displayName, bio, location, isPrivate, showFollowList });
      if (result.user) {
        const updatedUser = { ...user, ...result.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout();
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">⚙️ Account Settings</h1>

      <div className="space-y-4">
        <FormInput label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        <FormInput label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
        <FormInput label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Your location" />

        <ToggleSwitch label="Make account private" checked={isPrivate} onChange={setIsPrivate} />
        <ToggleSwitch label="Show follower & following lists" checked={showFollowList} onChange={setShowFollowList} />
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={() => setShowDeleteModal(true)} className="text-red-500 hover:underline text-sm">
          Delete my account
        </button>
      </div>

      <ChangePasswordCard />

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteAccount} />
      )}
    </div>
  );
}
