// src/hooks/useMemories.js
import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

export function useMemories({ type = 'private' } = {}) {
  const [memories, setMemories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const url = type === 'public' ? '/memory/public/all' : '/memory';
        const res = await axios.get(url);

        const data = type === 'public' ? res.data.memories : res.data;

        setMemories(data);
        setFiltered(data);
      } catch (err) {
        console.error(`Error fetching ${type} memories:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [type]);

  return { memories, filtered, loading, setMemories, setFiltered };
}
