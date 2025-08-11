import React from "react";
import DatePicker from "react-datepicker";

export default function FilterBar({
  emotions = [],
  selectedEmotion = "All",
  onFilter,
  showMonthPicker = false,
  month,               // Date
  onMonthChange,       // (Date) => void
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
      {/* Emotion chips */}
      <div className="flex gap-2 flex-wrap justify-center">
        {emotions.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => onFilter && onFilter(label)}
            className={`px-3 py-1 rounded-full border text-sm ${
              selectedEmotion === label
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700"
            } hover:bg-purple-100 transition`}
          >
            {emoji ? `${emoji} ` : ""}{label}
          </button>
        ))}
      </div>

      {/* Optional month picker */}
      {showMonthPicker && (
        <div className="flex justify-center">
          <DatePicker
            selected={month}
            onChange={(d) => onMonthChange && onMonthChange(d)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="border rounded px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}
