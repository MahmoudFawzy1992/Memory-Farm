import EmojiPicker from './EmojiPicker';
import EmotionSelect from './EmotionSelect';
import ColorSelect from './ColorSelect';
import DatePicker from 'react-datepicker';

function MemoryForm({
  text,
  setText,
  emoji,
  setEmoji,
  emotion,
  setEmotion,
  color,
  setColor,
  memoryDate,
  setMemoryDate,
  onSubmit,
  errors = {}
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <textarea
          className="w-full border rounded p-3 h-32 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Write your memory here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {errors.text && <p className="text-sm text-red-600 mt-1">{errors.text}</p>}
      </div>

      <div className="flex gap-4 items-start">
        <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
        <EmotionSelect emotion={emotion} setEmotion={setEmotion} excludeAll={true} />
      </div>

      <div>
        <ColorSelect color={color} setColor={setColor} />
        {errors.color && <p className="text-sm text-red-600 mt-1">{errors.color}</p>}
      </div>

      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Memory Date</label>
        <DatePicker
          selected={memoryDate}
          onChange={(date) => setMemoryDate(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          maxDate={new Date()}
          placeholderText="Select the date of this memory"
        />
        {errors.memoryDate && <p className="text-sm text-red-600 mt-1">{errors.memoryDate}</p>}
      </div>

      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Save Memory
      </button>
    </form>
  );
}

export default MemoryForm;
