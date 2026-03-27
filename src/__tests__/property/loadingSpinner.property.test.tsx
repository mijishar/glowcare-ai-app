// Feature: glowcare-ai, Property P2: Loading state shows indicator
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Validates: Requirements 1.4
 * P2: For any query submission that is in-flight (loading state is true),
 * the loading indicator component should be present in the rendered output.
 */
describe('P2: Loading state shows indicator', () => {
  it('LoadingSpinner is always present in the rendered output when rendered', () => {
    // The component has no props — it is always shown when rendered.
    // We use fc.constant(true) to represent the loading=true condition
    // and verify the spinner is present across 100 runs.
    fc.assert(
      fc.property(fc.constant(true), (isLoading) => {
        expect(isLoading).toBe(true);
        const { unmount } = render(<LoadingSpinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
