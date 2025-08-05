import { Link } from "react-router-dom";

export default function MemoryHeader({ memory, user }) {
  const isOwner =
    user &&
    memory &&
    (memory.userId === user._id || memory.userId?._id === user._id);

  // ✅ Only show header if author is different from current user
  if (!memory?.userId || isOwner) return null;

  const author = memory.userId;

  return (
    <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
      <Link
        to={`/user/${author._id}`}
        className="font-semibold text-purple-600 hover:underline"
      >
        {author.displayName}
      </Link>
    </div>
  );
}
