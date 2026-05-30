import React from 'react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  theme?: 'blue' | 'red' | 'neutral' | 'green';
  progressBarWidth?: string; // e.g., "50%" or "100%"
  showDot?: boolean;
  children: React.ReactNode;
}
