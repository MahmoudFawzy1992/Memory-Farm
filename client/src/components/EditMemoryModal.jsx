import { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import EmotionSelect from './EmotionSelect';
import ColorSelect from './ColorSelect';

function EditMemoryModal({
  show,
  onClose,
  onUpdate,
  editedText,
  setEditedText,
  editedEmoji,
  setEditedEmoji,
  editedEmotionText,
  setEditedEmotionText,
  editedColor,
  setEditedColor,
  showPicker,
  setShowPicker,
}) {
  const [errors, setErrors] = useState({});

  if (!show) return null;

  const validate = () => {
    const newErrors = {};
    if (!editedText.trim()) {
      newErrors.text = 'Memory text is required.';
    }

    if (editedColor && !/^(\w+-\d{3})$/.test(editedColor)) {
      newErrors.color = 'Color format must be like purple-500';
    }

    return newErrors;
  };

  const handleUpdateClick = () => {
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h3 className="text-lg font-semibold mb-3">Edit Memory</h3>

        <div>
          <textarea
            className="w-full border rounded p-2 h-24 mb-1"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
          {errors.text && (
            <p className="text-sm text-red-600 mt-1">{errors.text}</p>
          )}
        </div>

        <div className="flex gap-4 mb-3">
          <div>
            <div
              className="cursor-pointer text-2xl border p-2 rounded w-fit hover:bg-purple-100"
              onClick={() => setShowPicker(!showPicker)}
            >
              {editedEmoji || '🌸'}
            </div>
            {showPicker && (
              <Picker
                data={data}
                onEmojiSelect={(e) => {
                  setEditedEmoji(e.native);
                  setShowPicker(false);
                }}
                theme="light"
              />
            )}
          </div>

          <EmotionSelect
            emotion={editedEmotionText}
            setEmotion={setEditedEmotionText}
            excludeAll={true}
          />
        </div>

        <div>
          <ColorSelect color={editedColor} setColor={setEditedColor} />
          {errors.color && (
            <p className="text-sm text-red-600 mt-1">{errors.color}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 text-sm rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            onClick={handleUpdateClick}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMemoryModal;
