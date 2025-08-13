import { format, isSameDay } from "date-fns";

export default function MoodCalendar({ days, summary, selectedDate, onDayClick }) {
  const countFor = (d) => {
    const hit = summary.find(x => isSameDay(new Date(x.date), d));
    return hit?.count || 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Calendar View
        {selectedDate && (
          <span className="text-purple-600 ml-2 text-base font-normal">
            • {format(selectedDate, "MMMM d, yyyy")}
          </span>
        )}
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {/* Calendar Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
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
              className={`p-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                isSelected 
                  ? "bg-purple-100 border-purple-400 shadow-md" 
                  : "bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
              } ${isToday ? "ring-2 ring-purple-300" : ""}`}
              title={`${format(d, "MMM d")} • ${memCount} memories`}
            >
              <div className={`font-semibold ${isToday ? "text-purple-700" : "text-gray-800"}`}>
                {format(d, "d")}
              </div>
              <div className={`text-xs ${memCount > 0 ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                {memCount} {memCount === 1 ? "memory" : "memories"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}