import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card><span>Card Content</span></Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}><span>Clickable</span></Card>);
    
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
