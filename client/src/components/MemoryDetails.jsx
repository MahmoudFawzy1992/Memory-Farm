import { Link } from "react-router-dom";

function MemoryDetails({ memory }) {
  let createdAt = "Unknown";
  let updatedAt = null;

  try {
    createdAt = new Date(memory.createdAt).toLocaleString();
    if (
      memory.updatedAt &&
      memory.updatedAt !== memory.createdAt
    ) {
      updatedAt = new Date(memory.updatedAt).toLocaleString();
    }
  } catch {
    createdAt = "Invalid Date";
  }

  const isPublic = memory.isPublic;
  const author = memory.userId;

  return (
    <div className="space-y-4">
      {/* Privacy + Author Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
            isPublic
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {isPublic ? "🌍 Public Memory" : "🔒 Private Memory"}
        </span>

        {author && author.displayName && (
          <Link
            to={`/user/${author._id}`}
            className="hover:underline text-purple-600"
          >
            By: {author.displayName}
          </Link>
        )}
      </div>

      {/* Core Memory Info */}
      <h2 className="text-2xl font-bold text-purple-600">
        🌱 Memory Details
      </h2>

      <p className={`text-lg text-${memory.color || "purple-500"}`}>
        <strong>Emotion:</strong> {memory.emotion || "None"}
      </p>

      <p className="text-md text-gray-700 whitespace-pre-line">
        {memory.text || "No description provided."}
      </p>

      {/* Timestamps */}
      <div className="text-xs text-gray-400">
        <p>Created: {createdAt}</p>
        {updatedAt && <p>Last updated: {updatedAt}</p>}
      </div>
    </div>
  );
}

export default MemoryDetails;
