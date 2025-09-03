import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { emotionFamilies, emotionSearchIndex } from '../constants/emotions';

export default function useEmotionSearch(searchTerm) {
  // Initialize Fuse for fuzzy search
  const fuse = useMemo(() => new Fuse(emotionSearchIndex, {
    keys: ['label', 'searchTerms'],
    threshold: 0.3,
    includeScore: true
  }), []);

  // Filter emotions based on search
  const filteredEmotions = useMemo(() => {
    if (!searchTerm.trim()) {
      // Group emotions by family for better organization
      return Object.entries(emotionFamilies).map(([familyKey, family]) => ({
        family: family.label,
        color: family.color,
        emotions: family.emotions
      }));
    }

    const results = fuse.search(searchTerm.trim());
    return results.length > 0 ? 
      [{ family: 'Search Results', emotions: results.map(r => r.item) }] :
      [{ family: 'No matches found', emotions: [] }];
  }, [searchTerm, fuse]);

  return { filteredEmotions };
}