import React from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  mono?: boolean;
  focusVariant?: 'red' | 'blue' | 'emerald' | 'neutral';
}
