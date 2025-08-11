import { Link } from "react-router-dom";
import { format } from "date-fns";

function MemoryDetails({ memory }) {
  // Prefer memoryDate; fall back to createdAt for legacy items
  let primaryDate = null;
  try {
    const d = memory?.memoryDate || memory?.createdAt;
    primaryDate = d ? format(new Date(d), "PPP") : null;
  } catch {
    primaryDate = null;
  }

  let createdAt = null;
  let updatedAt = null;
  try {
    if (memory?.createdAt) createdAt = format(new Date(memory.createdAt), "Pp");
    if (memory?.updatedAt && memory.updatedAt !== memory.createdAt) {
      updatedAt = format(new Date(memory.updatedAt), "Pp");
    }
  } catch {
    /* ignore */
  }

  const isPublic = !!memory?.isPublic;
  const author = memory?.userId || memory?.author;

  return (
    <div className="space-y-4">
      {/* Privacy + Author */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
            isPublic ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
          }`}
        >
          {isPublic ? "🌍 Public Memory" : "🔒 Private Memory"}
        </span>

        {author?.displayName && (
          <Link to={`/user/${author._id || author.id}`} className="hover:underline text-purple-600">
            By: {author.displayName}
          </Link>
        )}
      </div>

      <h2 className="text-2xl font-bold text-purple-600">🌱 Memory Details</h2>

      {/* Primary date */}
      {primaryDate && (
        <p className="text-md">
          <span className="font-semibold text-purple-600">Date:</span>{" "}
          <span className="text-gray-700">{primaryDate}</span>
        </p>
      )}

      {/* Emotion */}
      <p className={`text-lg text-${memory.color || "purple-500"}`}>
        <strong>Emotion:</strong> {memory.emotion || "None"}
      </p>

      {/* Text */}
      <p className="text-md text-gray-700 whitespace-pre-line">
        {memory.text || "No description provided."}
      </p>

      {/* Timestamps */}
      <div className="text-xs text-gray-400">
        {createdAt && <p>Created: {createdAt}</p>}
        {updatedAt && <p>Last updated: {updatedAt}</p>}
      </div>
    </div>
  );
}

export default MemoryDetails;
