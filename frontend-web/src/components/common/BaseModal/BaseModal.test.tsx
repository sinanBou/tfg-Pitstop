import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseModal } from './BaseModal';

describe('BaseModal', () => {
  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={false} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose} title="Test Modal" subtitle="Modal Subtitle">
        <div>Modal Content</div>
      </BaseModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when close button or overlay is clicked', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
