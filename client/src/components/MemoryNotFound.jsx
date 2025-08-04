import { Link } from "react-router-dom";

export default function MemoryNotFound() {
  return (
    <div className="text-center py-10 text-red-600">
      <h1 className="text-3xl font-bold mb-2">❌ Memory not found</h1>
      <p className="text-gray-500">It may have been deleted or is private.</p>
      <Link
        to="/"
        className="text-purple-600 hover:underline mt-4 inline-block"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
