import { format } from "date-fns";
import MemoryCard from "../MemoryCard";

export default function MemoriesView({ 
  filteredMemories, 
  selectedDate, 
  month, 
  selectedEmotion,
  onBackToMonth 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {selectedDate 
            ? `Memories for ${format(selectedDate, "MMMM d, yyyy")}`
            : `All Memories - ${format(month, "MMMM yyyy")}`
          }
          {selectedEmotion !== "All" && (
            <span className="text-purple-600 ml-2">• {selectedEmotion}</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredMemories.length} {filteredMemories.length === 1 ? "memory" : "memories"}
          </span>
          {selectedDate && (
            <button
              onClick={onBackToMonth}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to month
            </button>
          )}
        </div>
      </div>

      {filteredMemories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {selectedDate ? "📝" : "📊"}
          </div>
          <p className="text-gray-500 text-lg">
            {selectedDate 
              ? "No memories on this day."
              : "No memories for this month yet."
            }
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Start journaling to see your mood patterns!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMemories.map((memory) => (
            <MemoryCard key={memory._id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}