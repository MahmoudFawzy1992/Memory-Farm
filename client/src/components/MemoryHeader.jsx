import { Link } from "react-router-dom";

export default function MemoryHeader({ memory, user }) {
  const isOwner = user && memory && memory.userId === user.id;

  if (!memory?.author || isOwner) return null;

  return (
    <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
      <Link
        to={`/user/${memory.author._id}`}
        className="font-semibold text-purple-600 hover:underline"
      >
        {memory.author.displayName}
      </Link>
    </div>
  );
}
