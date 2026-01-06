
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pricing } from '@/components/marketing/Pricing';

describe('Pricing Component', () => {
    it('renders the Recruit (Free) tier', () => {
        render(<Pricing />);
        expect(screen.getByText('Recruit')).toBeTruthy();
        expect(screen.getByText('$0')).toBeTruthy();
    });

    it('renders the Titan (Premium) tier with correct price', () => {
        render(<Pricing />);
        expect(screen.getByText('Titan')).toBeTruthy();
        expect(screen.getByText('$9')).toBeTruthy();
        expect(screen.getByText('/mo')).toBeTruthy();
    });

    it('renders CTA links correctly', () => {
        render(<Pricing />);
        const freeLink = screen.getByRole('link', { name: /Start Journey/i });
        expect(freeLink.getAttribute('href')).toBe('/login');

        const premiumLink = screen.getByRole('link', { name: /Ascend Now/i });
        expect(premiumLink.getAttribute('href')).toBe('/login?plan=titan');
    });

    it('lists premium features', () => {
        render(<Pricing />);
        expect(screen.getByText('Oracle AI Coach')).toBeTruthy();
        expect(screen.getByText('Full Battle Pass Access')).toBeTruthy();
    });
});
