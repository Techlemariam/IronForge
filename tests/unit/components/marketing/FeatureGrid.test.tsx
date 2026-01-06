
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';

// Mock Lucide icons to avoid rendering issues if any
vi.mock('lucide-react', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...(mod as object),
        // You can add specific mocks if needed, otherwise use actual
    };
});

describe('FeatureGrid Component', () => {
    it('renders the section title', () => {
        render(<FeatureGrid />);
        expect(screen.getByText(/A New Era of/i)).toBeTruthy();
        expect(screen.getByText(/Performance/i)).toBeTruthy();
    });

    it('renders key feature cards', () => {
        render(<FeatureGrid />);
        expect(screen.getByText('The Oracle AI')).toBeTruthy();
        expect(screen.getByText('V-Sync Bio-Feedback')).toBeTruthy();
        expect(screen.getByText('Titan Battle Pass')).toBeTruthy();
        expect(screen.getByText('Power Rating')).toBeTruthy();
    });

    it('renders feature descriptions', () => {
        render(<FeatureGrid />);
        expect(screen.getByText(/Proprietary engine that analyzes HRV/i)).toBeTruthy();
    });
});
