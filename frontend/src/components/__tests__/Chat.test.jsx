import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../Social/Chat';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock scrollTo since it's not implemented in JSDOM
Element.prototype.scrollTo = vi.fn();

describe('Chat Component', () => {
    let mockSocket;
    const mockBattleData = {
        options: [{ id: 'opt1' }, { id: 'opt2' }],
        theme: { optionAColor: 'red', optionBColor: 'blue' }
    };

    beforeEach(() => {
        mockSocket = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        };
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders closed initially and opens on click', () => {
        render(<Chat battleId="123" fingerprint="user1" socket={mockSocket} battleData={mockBattleData} />);

        // Check for toggle button (using the emoji)
        const toggleBtn = screen.getByText('💬');
        expect(toggleBtn).toBeInTheDocument();

        // Click toggle
        fireEvent.click(toggleBtn);

        // Check if opens
        expect(screen.getByText('CHATEÁ EN VIVO')).toBeInTheDocument();
    });

    it('sends a message', async () => {
        render(<Chat battleId="123" fingerprint="user1" socket={mockSocket} battleData={mockBattleData} />);
        fireEvent.click(screen.getByText('💬'));

        // Mock fetch response for message
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [] // Initial load
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ nickname: 'Hero', content: 'Hello', fingerprint: 'user1' }) // Post response
        });

        // Type nickname
        const nicknameInput = screen.getByPlaceholderText('Tu Apodo...');
        fireEvent.change(nicknameInput, { target: { value: 'Hero' } });

        // Type message
        const messageInput = screen.getByPlaceholderText('Escribí algo...');
        fireEvent.change(messageInput, { target: { value: 'Hello' } });

        // Submit
        const submitBtn = screen.getByText('→');
        expect(submitBtn).toBeEnabled();
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/battles/123/comments'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        fingerprint: 'user1',
                        content: 'Hello',
                        nickname: 'Hero'
                    })
                })
            );
        });
    });
});
