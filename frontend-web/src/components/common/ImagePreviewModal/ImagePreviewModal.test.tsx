import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreviewModal } from './ImagePreviewModal';

describe('ImagePreviewModal', () => {
  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(
      <ImagePreviewModal
        isOpen={false}
        onClose={handleClose}
        imageUrl="test.jpg"
        title="Test Image"
      />
    );

    expect(screen.queryByAltText('Test Image')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    const handleClose = vi.fn();
    render(
      <ImagePreviewModal
        isOpen={true}
        onClose={handleClose}
        imageUrl="test.jpg"
        title="Test Image"
      />
    );

    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    expect(screen.getByText('Test Image')).toBeInTheDocument();
  });

  it('calls onClose when close button or overlay is clicked', () => {
    const handleClose = vi.fn();
    render(
      <ImagePreviewModal
        isOpen={true}
        onClose={handleClose}
        imageUrl="test.jpg"
        title="Test Image"
      />
    );

    const closeBtn = screen.getByTestId('image-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const overlay = screen.getByTestId('image-modal-overlay');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
