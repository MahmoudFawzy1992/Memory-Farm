import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSimpleInsights from '../../hooks/useSimpleInsights';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('../../utils/axiosInstance');
vi.mock('react-toastify');

describe('useSimpleInsights Hook', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchInsights', () => {
    it('should fetch insights successfully', async () => {
      const mockInsights = [
        { _id: '1', title: 'Insight 1', message: 'Great progress!' },
        { _id: '2', title: 'Insight 2', message: 'Keep going!' }
      ];

      axios.get.mockResolvedValue({
        data: {
          insights: mockInsights,
          meta: { totalInsights: 2, userMemoryCount: 10 }
        }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.insights).toEqual(mockInsights);
      expect(result.current.insights.length).toBe(2);
    });

    it('should handle fetch errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.insights).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should mark insight as read', async () => {
      const mockInsights = [
        { _id: '1', title: 'Insight 1', isRead: false }
      ];

      axios.get.mockResolvedValue({
        data: { insights: mockInsights }
      });

      axios.patch.mockResolvedValue({
        data: {
          insight: { _id: '1', title: 'Insight 1', isRead: true }
        }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.markAsRead('1');
      });

      expect(axios.patch).toHaveBeenCalledWith('/insights/1/read');
      expect(result.current.insights[0].isRead).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const mockInsights = [
        { _id: '1', title: 'Insight 1', isFavorited: false }
      ];

      axios.get.mockResolvedValue({
        data: { insights: mockInsights }
      });

      axios.patch.mockResolvedValue({
        data: {
          insight: { _id: '1', isFavorited: true },
          isFavorited: true
        }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleFavorite('1');
      });

      expect(axios.patch).toHaveBeenCalledWith('/insights/1/favorite');
      expect(result.current.insights[0].isFavorited).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Insight added to favorites');
    });
  });

  describe('regenerateInsight', () => {
    it('should regenerate insight successfully', async () => {
      const mockInsights = [
        { 
          _id: '1', 
          title: 'Insight 1', 
          message: 'Old message',
          aiMetadata: { regenerateCount: 0 }
        }
      ];

      axios.get.mockResolvedValue({
        data: { insights: mockInsights }
      });

      axios.post.mockResolvedValue({
        data: {
          success: true,
          insight: {
            _id: '1',
            title: 'Insight 1',
            message: 'New regenerated message!',
            aiMetadata: { regenerateCount: 1 }
          },
          regenerateCount: 1,
          remainingRegenerations: 2
        }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.regenerateInsight('1');
      });

      expect(axios.post).toHaveBeenCalledWith('/insights/1/regenerate');
      expect(result.current.insights[0].message).toBe('New regenerated message!');
      expect(result.current.insights[0].aiMetadata.regenerateCount).toBe(1);
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle regeneration errors', async () => {
      const mockInsights = [{ _id: '1', title: 'Insight 1' }];

      axios.get.mockResolvedValue({
        data: { insights: mockInsights }
      });

      axios.post.mockRejectedValue({
        response: {
          data: {
            error: 'Regeneration limit reached',
            message: 'You can only regenerate 3 times'
          }
        }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.regenerateInsight('1');
      });

      expect(toast.error).toHaveBeenCalledWith('You can only regenerate 3 times');
    });
  });

  describe('computed values', () => {
    it('should calculate unread count correctly', async () => {
      const mockInsights = [
        { _id: '1', isRead: false },
        { _id: '2', isRead: false },
        { _id: '3', isRead: true }
      ];

      axios.get.mockResolvedValue({
        data: { insights: mockInsights }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it('should filter favorite insights correctly', async () => {
      const mockInsights = [
        { _id: '1', isFavorited: true },
        { _id: '2', isFavorited: false },
        { _id: '3', isFavorited: true }
      ];

      axios.get.mockResolvedValue({
        data: { insights: mockInsights }
      });

      const { result } = renderHook(() => useSimpleInsights());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.favoriteInsights.length).toBe(2);
    });
  });
});