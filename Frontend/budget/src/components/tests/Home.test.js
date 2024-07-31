import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Home from '../Home';

// Mock axios
jest.mock('axios');

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home Component', () => {
  beforeEach(() => {
    // Mock localStorage
    localStorage.setItem('token', 'dummy-token');
    
    // Mock axios responses
    axios.get.mockImplementation((url, { headers }) => {
      if (url === 'http://localhost:8000/api/protected' && headers.Authorization === 'Bearer dummy-token') {
        return Promise.resolve();
      }
      if (url === 'http://localhost:8000/api/budget') {
        return Promise.resolve({ data: [] });
      }
      if (url === 'http://localhost:8000/api/budget/check-limit') {
        return Promise.resolve({ data: { isExceeded: false } });
      }
      return Promise.reject(new Error('Not Found'));
    });
  });

  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );
    });
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('renders Add Budget button', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );
    });
    const addButton = await screen.findByTestId('add-budget-button');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('Add Budget');
  });

  test('renders correct content based on API response', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );
    });

    // Wait for content to be updated based on API response
    await waitFor(() => {
      expect(screen.getByText('Welcome to the Budget Tracker')).toBeInTheDocument();
    });
  });

  test('renders logout button with correct aria-label', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );
    });
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
  });

  test('clicking Budget Analysis button navigates to /BudgetAnalysis', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );
    });

    // Find the Budget Analysis button using aria-label
    const budgetAnalysisButton = screen.getByLabelText('Budget Analysis');
    
    // Simulate click event
    fireEvent.click(budgetAnalysisButton);
    
    // Assert that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/BudgetAnalysis');
  });
});
