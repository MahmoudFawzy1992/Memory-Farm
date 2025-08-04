import {emotions} from '../constants/emotions'

function EmotionSelect({ emotion, setEmotion, excludeAll = false }) {
  const options = excludeAll
    ? emotions.filter((opt) => opt.label !== 'All')
    : emotions

  return (
    <div className="w-full">
      <label className="text-sm text-gray-700 mb-1">Emotion (select)</label>
      <select
        value={emotion}
        onChange={(e) => setEmotion(e.target.value)}
        className="w-full border rounded px-2 py-1"
        required
      >
        <option value="">Select emotion</option>
        {options.map((opt) => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default EmotionSelect
