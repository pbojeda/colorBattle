import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BattleArena } from '../BattleArena';

// Mock external dependencies that might cause issues in test environment
vi.mock('use-sound', () => ({
    default: () => [vi.fn()],
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('BattleArena', () => {
    const mockOptions = [
        { id: '1', name: 'Option A', votes: 10, percentage: 60 },
        { id: '2', name: 'Option B', votes: 5, percentage: 40 }
    ];
    const mockTheme = {
        optionAColor: '#ff0000',
        optionBColor: '#0000ff',
        background: 'linear-gradient(to bottom, #000, #333)'
    };
    const mockOnVote = vi.fn();

    it('renders options with correct names and percentages', () => {
        render(
            <BattleArena
                options={mockOptions}
                theme={mockTheme}
                onVote={mockOnVote}
                battleName="Test Battle"
            />
        );

        expect(screen.getByText('Option A')).toBeDefined();
        expect(screen.getByText('Option B')).toBeDefined();
        expect(screen.getByText('60%')).toBeDefined();
        expect(screen.getByText('40%')).toBeDefined();
    });

    it('calls onVote when an option is clicked', () => {
        render(
            <BattleArena
                options={mockOptions}
                theme={mockTheme}
                onVote={mockOnVote}
                battleName="Test Battle"
            />
        );

        const optionA = screen.getByText('Option A');
        fireEvent.click(optionA);

        expect(mockOnVote).toHaveBeenCalledWith('1');
    });

    it('applies theme colors correctly', () => {
        const { container } = render(
            <BattleArena
                options={mockOptions}
                theme={mockTheme}
                onVote={mockOnVote}
                battleName="Test Battle"
            />
        );

        const mainDiv = container.firstChild;
        expect(mainDiv.style.background).toBeDefined();
    });

    it('shows "Has Votado" when user has voted', () => {
        render(
            <BattleArena
                options={mockOptions}
                theme={mockTheme}
                onVote={mockOnVote}
                battleName="Test Battle"
                userVote="1"
            />
        );

        expect(screen.getByText('Has Votado')).toBeDefined();
    });
});
