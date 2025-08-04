import MemoryCard from "./MemoryCard";

export default function UserMemoryGrid({ memories }) {
  const safeMemories = Array.isArray(memories) ? memories : [];

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-4">🌈 Public Memories</h2>
      {safeMemories.length === 0 ? (
        <p className="text-gray-500 italic">No public memories to show.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeMemories.map((memory) => (
            <MemoryCard key={memory._id} memory={memory} />
          ))}
        </div>
      )}
    </>
  );
}
