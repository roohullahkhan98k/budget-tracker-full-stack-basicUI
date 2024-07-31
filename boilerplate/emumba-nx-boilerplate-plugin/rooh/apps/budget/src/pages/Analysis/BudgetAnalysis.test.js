import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom';
import BudgetAnalysis from './analysis';

// Mock axios
jest.mock('axios');

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('BudgetAnalysis Component', () => {
  beforeEach(() => {
    // Mock localStorage
    localStorage.setItem('token', 'dummy-token');
    
    // Mock axios responses
    axios.get.mockImplementation((url, { headers }) => {
      if (url === 'http://localhost:8000/api/protected' && headers.Authorization === 'Bearer dummy-token') {
        return Promise.resolve();
      }
      if (url === 'http://localhost:8000/api/budget/analysis') {
        return Promise.resolve({ data: { budgetEntries: [], isLimitExceeded: false } });
      }
      return Promise.reject(new Error('Not Found'));
    });
  });

  test('renders without crashing and contains the title "Budget Analysis"', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <BudgetAnalysis />
        </MemoryRouter>
      );
    });
    expect(screen.getByText('Budget Analysis')).toBeInTheDocument();
  });

  test('filter change updates the selected filter value correctly', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <BudgetAnalysis />
        </MemoryRouter>
      );
    });

    const filterSelect = screen.getByLabelText(/filter by:/i);
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'Last 12 Months' } });
    });

    await waitFor(() => {
      expect(filterSelect.value).toBe('Last 12 Months');
    });
  });

  test('renders "Refresh Data" button and it is clickable', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <BudgetAnalysis />
        </MemoryRouter>
      );
    });

    const refreshButton = screen.getByText('Refresh Data');
    expect(refreshButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(refreshButton);
    });
  });

  test('displays warning message when budget limit is exceeded', async () => {

    axios.get.mockResolvedValue({
      data: {
        budgetEntries: [],
        isLimitExceeded: true,
      },
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BudgetAnalysis />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      const warningMessage = screen.getByText(/you have exceeded your budget limit/i);
      expect(warningMessage).toBeInTheDocument();
    });
  });
});