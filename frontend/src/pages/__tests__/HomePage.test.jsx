import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import axios from 'axios';

vi.mock('axios');

const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('HomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        axios.get.mockImplementation(() => new Promise(() => { })); // Never resolves
        renderWithRouter(<HomePage />);
        expect(screen.getByRole('status')).toBeDefined(); // Assuming the spinner has a role or class we can find
    });

    it('renders trending and recent battles after loading', async () => {
        const mockTrending = [
            { battleId: 'trending-1', name: 'Trending Battle', totalVotes: 10, options: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }] }
        ];
        const mockRecent = [
            { battleId: 'recent-1', name: 'Recent Battle', totalVotes: 5, options: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }] }
        ];

        axios.get.mockImplementation((url) => {
            if (url.includes('trending')) return Promise.resolve({ data: mockTrending });
            if (url.includes('battles')) return Promise.resolve({ data: mockRecent });
            return Promise.resolve({ data: [] });
        });

        renderWithRouter(<HomePage />);

        await waitFor(() => {
            expect(screen.getByText('Trending Battle')).toBeDefined();
            expect(screen.getByText('Recent Battle')).toBeDefined();
        });
    });

    it('validates form before submission', async () => {
        const mockTrending = [];
        axios.get.mockResolvedValue({ data: [] });

        renderWithRouter(<HomePage />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('ej. Gatos vs Perros')).toBeDefined();
        });

        const submitButton = screen.getByText('¡Empezar Batalla! 🚀');
        fireEvent.click(submitButton);

        // Should not call axios.post if fields are empty
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('shows alert on battle creation failure', async () => {
        vi.spyOn(window, 'alert').mockImplementation(() => { });
        axios.get.mockResolvedValue({ data: [] });
        axios.post.mockRejectedValue(new Error('API Failure'));

        renderWithRouter(<HomePage />);

        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText('ej. Gatos vs Perros'), { target: { value: 'Test' } });
            fireEvent.change(screen.getByPlaceholderText('Gatos'), { target: { value: 'A' } });
            fireEvent.change(screen.getByPlaceholderText('Perros'), { target: { value: 'B' } });
        });

        fireEvent.click(screen.getByText('¡Empezar Batalla! 🚀'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to create battle');
        });
    });
});
