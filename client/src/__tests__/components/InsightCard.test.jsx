import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InsightCard from '../../components/insights/InsightCard';

describe('InsightCard Component', () => {
  const mockInsight = {
    _id: 'insight123',
    title: 'Welcome to Your Journey!',
    message: 'This is your first memory. Great start!',
    icon: '🌱',
    color: '#10B981',
    category: 'achievement',
    priority: 5,
    triggerMemoryCount: 1,
    isRead: false,
    isFavorited: false,
    createdAt: new Date().toISOString(),
    aiMetadata: {
      model: 'gpt-4o-mini',
      regenerateCount: 0
    }
  };

  const mockHandlers = {
    onMarkAsRead: vi.fn(),
    onToggleFavorite: vi.fn(),
    onRegenerate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render insight card with title and message', () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    expect(screen.getByText('Welcome to Your Journey!')).toBeInTheDocument();
    expect(screen.getByText(/This is your first memory/)).toBeInTheDocument();
  });

  it('should show unread indicator when insight is unread', () => {
  const { container } = render(<InsightCard insight={mockInsight} {...mockHandlers} />);
  
  // ✅ Find the outer card wrapper (has the ring classes)
  const card = container.querySelector('.ring-2.ring-purple-100');
  expect(card).toBeInTheDocument();
});

  it('should not show unread indicator when insight is read', () => {
    const readInsight = { ...mockInsight, isRead: true };
    render(<InsightCard insight={readInsight} {...mockHandlers} />);
    
    const card = screen.getByText('Welcome to Your Journey!').closest('div');
    expect(card).not.toHaveClass('ring-2');
  });

  it('should call onMarkAsRead when mark as read button clicked', async () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    const button = screen.getByText(/Mark as read/);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockHandlers.onMarkAsRead).toHaveBeenCalledWith('insight123');
    });
  });

  it('should call onToggleFavorite when favorite button clicked', async () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    const favoriteButton = screen.getByLabelText(/Add to favorites/);
    fireEvent.click(favoriteButton);
    
    await waitFor(() => {
      expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith('insight123');
    });
  });

  it('should show regenerate button with correct count', () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    expect(screen.getByText(/Try again \(3 left\)/)).toBeInTheDocument();
  });

  it('should call onRegenerate when regenerate button clicked', async () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    const regenerateButton = screen.getByText(/Try again \(3 left\)/);
    fireEvent.click(regenerateButton);
    
    await waitFor(() => {
      expect(mockHandlers.onRegenerate).toHaveBeenCalledWith('insight123');
    });
  });

  it('should show remaining regenerations correctly', () => {
    const insightWith1Regen = {
      ...mockInsight,
      aiMetadata: { regenerateCount: 2 }
    };
    
    render(<InsightCard insight={insightWith1Regen} {...mockHandlers} />);
    
    expect(screen.getByText(/Try again \(1 left\)/)).toBeInTheDocument();
  });

  it('should hide regenerate button when limit reached', () => {
    const insightMaxRegen = {
      ...mockInsight,
      aiMetadata: { regenerateCount: 3 }
    };
    
    render(<InsightCard insight={insightMaxRegen} {...mockHandlers} />);
    
    expect(screen.queryByText(/Try again/)).not.toBeInTheDocument();
    expect(screen.getByText(/Regeneration limit reached/)).toBeInTheDocument();
  });

  it('should show loading state when regenerating', async () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    const regenerateButton = screen.getByText(/Try again \(3 left\)/);
    fireEvent.click(regenerateButton);
    
    expect(screen.getByText(/Regenerating.../)).toBeInTheDocument();
  });

  it('should disable buttons when processing', async () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    const markAsReadButton = screen.getByText(/Mark as read/);
    fireEvent.click(markAsReadButton);
    
    // Button should be disabled during processing
    expect(markAsReadButton).toBeDisabled();
  });

  it('should show AI model indicator in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    expect(screen.getByText(/🤖 GPT/)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should not show actions when showActions is false', () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} showActions={false} />);
    
    expect(screen.queryByText(/Mark as read/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Try again/)).not.toBeInTheDocument();
  });

  it('should show read timestamp when insight is read', () => {
    const readInsight = {
      ...mockInsight,
      isRead: true,
      readAt: new Date().toISOString()
    };
    
    render(<InsightCard insight={readInsight} {...mockHandlers} />);
    
    expect(screen.getByText(/Read/)).toBeInTheDocument();
  });

  it('should display category badge correctly', () => {
    render(<InsightCard insight={mockInsight} {...mockHandlers} />);
    
    expect(screen.getByText(/🏆 achievement/)).toBeInTheDocument();
  });
});