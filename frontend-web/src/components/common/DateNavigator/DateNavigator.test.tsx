import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateNavigator } from './DateNavigator';

describe('DateNavigator', () => {
  it('renders correctly with given date', () => {
    const date = new Date(2026, 4, 15); // 15 de mayo de 2026
    const handleChange = vi.fn();

    render(<DateNavigator selectedDate={date} onChange={handleChange} />);

    // May 15 is Friday
    expect(screen.getByText('vie')).toBeInTheDocument();
    expect(screen.getByText('15 may')).toBeInTheDocument();
  });

  it('triggers onChange with previous day date when prev button is clicked', () => {
    const date = new Date(2026, 4, 15);
    const handleChange = vi.fn();

    render(<DateNavigator selectedDate={date} onChange={handleChange} />);

    const prevBtn = screen.getByTestId('prev-day-btn');
    fireEvent.click(prevBtn);

    expect(handleChange).toHaveBeenCalled();
    const calledDate = handleChange.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(14);
  });

  it('triggers onChange with next day date when next button is clicked', () => {
    const date = new Date(2026, 4, 15);
    const handleChange = vi.fn();

    render(<DateNavigator selectedDate={date} onChange={handleChange} />);

    const nextBtn = screen.getByTestId('next-day-btn');
    fireEvent.click(nextBtn);

    expect(handleChange).toHaveBeenCalled();
    const calledDate = handleChange.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(16);
  });

  it('opens mini calendar when calendar button is clicked', () => {
    const date = new Date(2026, 4, 15);
    const handleChange = vi.fn();

    render(<DateNavigator selectedDate={date} onChange={handleChange} />);

    const toggleBtn = screen.getByTestId('calendar-toggle-btn');
    fireEvent.click(toggleBtn);

    // Header of month selection should be shown
    expect(screen.getByText('mayo de 2026')).toBeInTheDocument();
  });
});
