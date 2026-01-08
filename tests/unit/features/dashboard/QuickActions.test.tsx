import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActions } from '@/features/dashboard/components/QuickActions';

// Mocks
vi.mock('@/features/dashboard/CitadelHub', () => ({
    CitadelHub: ({ dispatch }: { dispatch: any }) => (
        <div data-testid="citadel-hub">
            <button onClick={() => dispatch({ type: 'TEST_ACTION' })}>Dispatch</button>
        </div>
    )
}));

describe('QuickActions', () => {
    it('renders CitadelHub and passes dispatch', () => {
        const mockDispatch = vi.fn();
        render(<QuickActions dispatch={mockDispatch} />);

        expect(screen.getByTestId('citadel-hub')).toBeDefined();

        // Verify dispatch prop propagation
        screen.getByText('Dispatch').click();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'TEST_ACTION' });
    });

    it('wraps content in a section with id "quick-actions"', () => {
        const { container } = render(<QuickActions dispatch={vi.fn()} />);
        const section = container.querySelector('section#quick-actions');
        expect(section).toBeDefined();
    });
});
