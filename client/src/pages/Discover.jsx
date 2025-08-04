import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import { emotions } from "../constants/emotions";
import PageWrapper from "../components/PageWrapper";

export default function Discover() {
  const [memories, setMemories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState("All");

  useEffect(() => {
    const fetchPublicMemories = async () => {
      try {
        const res = await axios.get("/memory/public/all");

        // 🛡️ Filter out any memories with missing user reference
        const validMemories = res.data.memories.filter((m) => m.userId !== null);

        setMemories(validMemories);
        setFiltered(validMemories);
      } catch (err) {
        console.error("Failed to fetch public feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicMemories();
  }, []);

  const handleFilter = (label) => {
    setSelectedEmotion(label);
    if (label === "All") {
      setFiltered(memories);
    } else {
      const lower = label.toLowerCase();
      const filteredList = memories.filter((m) =>
        m.emotion?.toLowerCase().includes(lower)
      );
      setFiltered(filteredList);
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold text-purple-700 mb-6">🌍 Discover Public Memories</h1>

      <FilterBar
        emotions={emotions}
        selectedEmotion={selectedEmotion}
        onFilter={handleFilter}
      />

      {loading ? (
        <p className="text-gray-500 mt-4">Loading public memories...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 mt-6 text-center">No public memories found.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((m) => (
            <li
              key={m._id}
              className={`p-4 bg-white rounded-lg shadow border-t-4 border-${m.color || "purple-500"}`}
            >
              <Link to={`/memory/${m._id}`}>
                <p className="text-lg font-medium text-gray-700 line-clamp-3">{m.text}</p>
                <p className="text-sm mt-1 italic text-gray-500">{m.emotion}</p>
              </Link>

              {m.userId && (
                <div className="mt-2 text-sm text-purple-600">
                  by{" "}
                  <Link
                    to={`/user/${m.userId._id}`}
                    className="font-semibold hover:underline"
                  >
                    {m.userId.displayName}
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}
