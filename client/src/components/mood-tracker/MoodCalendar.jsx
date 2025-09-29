import { format, isSameDay } from "date-fns";

export default function MoodCalendar({ days, summary, selectedDate, onDayClick }) {
  const countFor = (d) => {
    const hit = summary.find(x => isSameDay(new Date(x.date), d));
    return hit?.count || 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Calendar View
        {selectedDate && (
          <span className="text-purple-600 ml-2 text-sm sm:text-base font-normal">
            • {format(selectedDate, "MMMM d, yyyy")}
          </span>
        )}
      </h2>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Calendar Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((d) => {
          const memCount = countFor(d);
          const isSelected = selectedDate && isSameDay(selectedDate, d);
          const isToday = isSameDay(d, new Date());
          
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDayClick(d)}
              className={`p-2 sm:p-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                isSelected 
                  ? "bg-purple-100 border-purple-400 shadow-md" 
                  : "bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
              } ${isToday ? "ring-2 ring-purple-300" : ""}`}
              title={`${format(d, "MMM d")} • ${memCount} memories`}
            >
              <div className={`font-semibold text-xs sm:text-sm ${isToday ? "text-purple-700" : "text-gray-800"}`}>
                {format(d, "d")}
              </div>
              
              {/* Desktop: Show text */}
              <div className={`hidden sm:block text-xs ${memCount > 0 ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                {memCount} {memCount === 1 ? "memory" : "memories"}
              </div>
              
              {/* Mobile: Show icon + number */}
              <div className={`flex items-center gap-1 sm:hidden ${memCount > 0 ? "text-purple-600" : "text-gray-400"}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs font-medium">{memCount}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}