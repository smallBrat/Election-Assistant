import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';

export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => <ProgressProvider>{children}</ProgressProvider>,
    ...options,
  });
}