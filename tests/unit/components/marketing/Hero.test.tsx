
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/marketing/Hero';

describe('Hero Component', () => {
    it('renders the main heading correctly', () => {
        render(<Hero />);
        // Check for "IronForge" and "RPG" in the main heading
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading.textContent).toMatch(/IronForge/i);
        expect(heading.textContent).toMatch(/RPG/i);
    });

    it('displays the Phase 3 badge', () => {
        render(<Hero />);
        expect(screen.getByText(/Phase 3: The Living Titan is Here/i)).toBeTruthy();
    });

    it('renders the CTA link to login', () => {
        render(<Hero />);
        const link = screen.getByRole('link', { name: /JOIN THE FACTION/i });
        expect(link.getAttribute('href')).toBe('/login');
    });

    it('renders the trailer button', () => {
        render(<Hero />);
        expect(screen.getByRole('button', { name: /WATCH TRAILER/i })).toBeTruthy();
    });
});
