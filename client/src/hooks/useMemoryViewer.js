import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { formatISO } from "date-fns";
import { generateMemoryMetadata, isMemoryOwner, getAuthorInfo } from "../utils/blockViewerUtils";

export default function useMemoryViewer(user) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [memory, setMemory] = useState(null);
  const [memoryMetadata, setMemoryMetadata] = useState(null);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit form state - keeping for backward compatibility with existing modal
  const [editedColor, setEditedColor] = useState("#8B5CF6");
  const [editedText, setEditedText] = useState("");
  const [editedEmotionText, setEditedEmotionText] = useState("");
  const [editedEmoji, setEditedEmoji] = useState("");
  const [editedMemoryDate, setEditedMemoryDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/memory/${id}`);
        const fetchedMemory = response.data;
        
        // Generate metadata for block-based display
        const metadata = generateMemoryMetadata(fetchedMemory);
        const authorData = getAuthorInfo(fetchedMemory, user);
        
        setMemory(fetchedMemory);
        setMemoryMetadata(metadata);
        setAuthorInfo(authorData);
        
        // Initialize edit form state for backward compatibility
        const emotion = metadata?.emotion?.emotion || "";
        const emojiMatch = emotion.match(/^\p{Emoji}/u);
        const emoji = emojiMatch ? emojiMatch[0] : "";
        const label = emoji ? emotion.slice(emoji.length).trim() : emotion;

        setEditedText(fetchedMemory.text || ""); // Legacy field
        setEditedEmoji(emoji);
        setEditedEmotionText(label);
        setEditedColor(fetchedMemory.color || "#8B5CF6");
        setEditedMemoryDate(
          fetchedMemory.memoryDate 
            ? new Date(fetchedMemory.memoryDate) 
            : new Date(fetchedMemory.createdAt)
        );
        
      } catch (err) {
        console.error("Failed to load memory:", err);
        setError(err.response?.status === 404 
          ? "Memory not found" 
          : "Failed to load memory"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemory();
    }
  }, [id, user]);

  const handleDelete = async () => {
    if (!memory || !authorInfo?.isOwner) return;
    
    try {
      await axios.delete(`/memory/${id}`);
      toast.success("Memory deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete memory");
    }
  };

  const handleUpdate = async () => {
    if (!memory || !authorInfo?.isOwner) return;
    
    try {
      const emotion = `${editedEmoji} ${editedEmotionText}`.trim();
      
      const updateData = {
        emotion,
        color: editedColor,
        memoryDate: editedMemoryDate 
          ? formatISO(editedMemoryDate, { representation: "date" }) 
          : undefined,
      };
      
      // Only include text if it exists (legacy support)
      if (editedText) {
        updateData.text = editedText;
      }

      await axios.put(`/memory/${id}`, updateData);
      setShowEditModal(false);
      toast.success("Memory updated successfully");
      
      // Refresh memory data
      window.location.reload();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update memory");
    }
  };

  const handleToggleVisibility = async () => {
    if (!memory || !authorInfo?.isOwner) return;
    
    try {
      const response = await axios.patch(`/memory/${id}/visibility`);
      
      setMemory(prev => ({ 
        ...prev, 
        isPublic: response.data.isPublic 
      }));
      
      toast.success(
        `Memory is now ${response.data.isPublic ? "public" : "private"}`
      );
    } catch (error) {
      console.error("Toggle visibility error:", error);
      toast.error("Failed to toggle visibility");
    }
  };

  // Navigation helpers
  const goBack = () => {
    navigate(-1);
  };

  const goToAuthor = () => {
    if (authorInfo?.author?._id) {
      navigate(`/user/${authorInfo.author._id}`);
    }
  };

  return {
    // Memory data
    memory,
    memoryMetadata,
    authorInfo,
    loading,
    error,
    
    // UI state
    showEditModal,
    setShowEditModal,
    showDeleteConfirm,
    setShowDeleteConfirm,
    
    // Edit form state (legacy compatibility)
    editedColor,
    setEditedColor,
    editedText,
    setEditedText,
    editedEmotionText,
    setEditedEmotionText,
    editedEmoji,
    setEditedEmoji,
    editedMemoryDate,
    setEditedMemoryDate,
    showPicker,
    setShowPicker,
    
    // Actions
    handleDelete,
    handleUpdate,
    handleToggleVisibility,
    goBack,
    goToAuthor,
    
    // Computed values
    isOwner: authorInfo?.isOwner || false,
    shouldShowAuthor: authorInfo?.shouldShowAuthor || false,
    authorName: authorInfo?.authorName || 'Unknown User'
  };
}