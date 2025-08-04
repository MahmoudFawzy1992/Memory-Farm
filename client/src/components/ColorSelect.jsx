import colorOptions from '../constants/colors'

function ColorSelect({ color, setColor }) {
  return (
    <div className="w-full">
      <label className="text-sm text-gray-700 mb-1">Color Tag</label>
      <select
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-full border rounded px-2 py-1"
        required
      >
        {colorOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ColorSelect
