import React from 'react';
import { render, screen } from '@testing-library/react';
import HelloWorld from '../HelloWorld';

test('renders Hello, World! text', () => {
  const { container } = render(<HelloWorld />);
  const textElement = screen.getByText(/hello, world!/i);
  expect(textElement).toBeInTheDocument();
});
