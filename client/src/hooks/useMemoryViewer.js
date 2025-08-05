import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";

export default function useMemoryViewer(user) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedColor, setEditedColor] = useState("purple-500");
  const [editedText, setEditedText] = useState("");
  const [editedEmotionText, setEditedEmotionText] = useState("");
  const [editedEmoji, setEditedEmoji] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/memory/${id}`)
      .then((res) => {
        const emotion = res.data.emotion || "";
        const emojiMatch = emotion.match(/^\p{Emoji}/u);
        const emoji = emojiMatch ? emojiMatch[0] : "";
        const label = emoji ? emotion.slice(emoji.length).trim() : emotion;

        setMemory(res.data);
        setEditedText(res.data.text);
        setEditedEmoji(emoji);
        setEditedEmotionText(label);
        setEditedColor(res.data.color || "purple-500");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load memory", err);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/memory/${id}`);
      toast.success("Memory deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete memory");
    }
  };

  const handleUpdate = async () => {
    try {
      const emotion = `${editedEmoji} ${editedEmotionText}`.trim();
      await axios.put(`/api/memory/${id}`, {
        text: editedText,
        emotion,
        color: editedColor,
      });
      setShowModal(false);
      window.location.reload();
    } catch {
      toast.error("Failed to update memory");
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const res = await axios.patch(`/api/memory/${id}/visibility`);
      setMemory((prev) => ({
        ...prev,
        isPublic: res.data.isPublic,
      }));
      toast.success(
        `Memory is now ${res.data.isPublic ? "public" : "private"}`
      );
    } catch {
      toast.error("Failed to toggle visibility");
    }
  };

const isOwner =
  user &&
  memory &&
  (memory.userId === user._id || memory.userId?._id === user._id);

  return {
    memory,
    loading,
    showModal,
    setShowModal,
    showDeleteConfirm,
    setShowDeleteConfirm,
    editedColor,
    setEditedColor,
    editedText,
    setEditedText,
    editedEmotionText,
    setEditedEmotionText,
    editedEmoji,
    setEditedEmoji,
    showPicker,
    setShowPicker,
    handleDelete,
    handleUpdate,
    handleToggleVisibility,
    isOwner,
  };
}
