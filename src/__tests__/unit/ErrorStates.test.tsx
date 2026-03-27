import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../../pages/Home';

// Mock the API service
vi.mock('../../services/api', () => ({
  queryAdvice: vi.fn(),
}));

// Mock hooks that touch localStorage
vi.mock('../../hooks/useQueryHistory', () => ({
  useQueryHistory: () => ({ addEntry: vi.fn(), history: [], clearHistory: vi.fn() }),
}));

vi.mock('../../hooks/useDailyTip', () => ({
  useDailyTip: () => 'Stay hydrated!',
}));

import { queryAdvice } from '../../services/api';

const mockQueryAdvice = vi.mocked(queryAdvice);

function renderHome() {
  return render(<Home />);
}

async function submitQuery(query = 'oily skin') {
  const textarea = screen.getByRole('textbox');
  fireEvent.change(textarea, { target: { value: query } });
  fireEvent.click(screen.getByRole('button', { name: /submit skin concern/i }));
}

describe('Error States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API error response', () => {
    it('displays error message when API returns an error', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('Unable to process your request. Please try again.'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to process your request. Please try again.');
    });

    it('shows a retry button after an API error', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('Server error'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('retries the request when retry button is clicked', async () => {
      mockQueryAdvice
        .mockRejectedValueOnce(new Error('Server error'))
        .mockRejectedValueOnce(new Error('Server error'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(mockQueryAdvice).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('API timeout', () => {
    it('displays timeout error message when request times out', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('Request timed out. Please try again.'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByRole('alert')).toHaveTextContent('Request timed out. Please try again.');
    });

    it('shows a retry button after a timeout error', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('Request timed out. Please try again.'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Malformed JSON from LLM', () => {
    it('displays a generic error message when LLM returns malformed JSON', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('An unexpected error occurred.'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred.');
    });

    it('shows a retry button after a malformed JSON error', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('An unexpected error occurred.'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading spinner', () => {
    it('shows loading spinner while request is in flight', async () => {
      // Never resolves during this test
      mockQueryAdvice.mockReturnValueOnce(new Promise(() => {}));

      renderHome();
      await submitQuery();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides loading spinner after an error', async () => {
      mockQueryAdvice.mockRejectedValueOnce(new Error('Server error'));

      renderHome();
      await submitQuery();

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });
});
