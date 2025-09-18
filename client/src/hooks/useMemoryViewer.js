import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { generateMemoryMetadata, isMemoryOwner, getAuthorInfo } from "../utils/blockViewerUtils";
import { updateMemory, deleteMemory, toggleMemoryVisibility, getMemoryById } from "../services/memoryService";

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
  
  // Legacy edit form state - keeping for backward compatibility
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
        
        const fetchedMemory = await getMemoryById(id);
        
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
      await deleteMemory(id);
      toast.success("Memory deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete memory");
    }
  };

  /**
   * Handle memory update with new block-based system
   */
  const handleUpdate = async (updateData) => {
    if (!memory || !authorInfo?.isOwner) return;
    
    try {
      const updatedMemory = await updateMemory(id, updateData);
      
      setShowEditModal(false);
      toast.success("Memory updated successfully! 🎉");
      
      // Update local state with new data
      const newMetadata = generateMemoryMetadata(updatedMemory);
      const newAuthorInfo = getAuthorInfo(updatedMemory, user);
      
      setMemory(updatedMemory);
      setMemoryMetadata(newMetadata);
      setAuthorInfo(newAuthorInfo);
      
      return updatedMemory;
      
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.error || "Failed to update memory";
      toast.error(errorMessage);
      throw error; // Re-throw to handle in EditMemoryModal
    }
  };

  /**
   * Legacy update handler for backward compatibility
   */
  const handleLegacyUpdate = async () => {
    if (!memory || !authorInfo?.isOwner) return;
    
    try {
      const emotion = `${editedEmoji} ${editedEmotionText}`.trim();
      
      const updateData = {
        emotion,
        color: editedColor,
        memoryDate: editedMemoryDate?.toISOString(),
      };
      
      // Only include text if it exists (legacy support)
      if (editedText) {
        updateData.text = editedText;
      }

      await updateMemory(id, updateData);
      setShowEditModal(false);
      toast.success("Memory updated successfully");
      
      // Refresh memory data
      window.location.reload();
    } catch (error) {
      console.error("Legacy update error:", error);
      toast.error("Failed to update memory");
    }
  };

  const handleToggleVisibility = async () => {
    if (!memory || !authorInfo?.isOwner) return;
    
    try {
      const response = await toggleMemoryVisibility(id);
      
      setMemory(prev => ({ 
        ...prev, 
        isPublic: response.isPublic 
      }));
      
      toast.success(
        `Memory is now ${response.isPublic ? "public" : "private"}`
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
    
    // Legacy edit form state (for backward compatibility)
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
    handleUpdate, // New block-based update
    handleLegacyUpdate, // Legacy update (kept for compatibility)
    handleToggleVisibility,
    goBack,
    goToAuthor,
    
    // Computed values
    isOwner: authorInfo?.isOwner || false,
    shouldShowAuthor: authorInfo?.shouldShowAuthor || false,
    authorName: authorInfo?.authorName || 'Unknown User'
  };
}