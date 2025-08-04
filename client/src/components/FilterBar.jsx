import React from 'react'

function FilterBar({ emotions, selectedEmotion, onFilter }) {
  return (
    <div className="flex gap-2 flex-wrap justify-center mt-2">
      {emotions.map(({ label, emoji }) => (
        <button
          key={label}
          onClick={() => onFilter(label)}
          className={`px-3 py-1 rounded-full border text-sm ${
            selectedEmotion === label
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700'
          } hover:bg-purple-100 transition`}
        >
          {emoji} {label}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
