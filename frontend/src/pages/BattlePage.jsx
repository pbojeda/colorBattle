import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useParams, Link } from 'react-router-dom';
import { BattleArena } from '../components/BattleArena';
import { io } from 'socket.io-client';

// Config
import API_URL_BASE from '../api/config';
const API_URL = `${API_URL_BASE}/api`;

function BattlePage() {
    const { battleId } = useParams();
    const [deviceId, setDeviceId] = useState(null);
    const [battleData, setBattleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Initialize FingerprintJS on mount
    useEffect(() => {
        const setFp = async () => {
            const fp = await FingerprintJS.load();
            const { visitorId } = await fp.get();
            setDeviceId(visitorId);
        };
        setFp();
    }, []);

    // 2. Poll for updates (Fallback) + WebSockets (Real-time)
    useEffect(() => {
        if (!deviceId || !battleId) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/battle/${battleId}`, {
                    params: { deviceId }
                });
                setBattleData(res.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching battle data:", error);
                setError("Failed to load battle. It might not exist.");
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Initial fetch

        // WebSocket Connection
        const socket = io(API_URL_BASE);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.emit('join_battle', battleId);
        });

        socket.on('vote_update', (newData) => {
            if (newData.battleId !== battleId) return;

            setBattleData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    options: newData.options,
                    totalVotes: newData.totalVotes
                    // userVote remains as is from local state/initial fetch
                };
            });
        });

        // Fallback Polling
        const interval = setInterval(fetchData, 10000);

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, [deviceId, battleId]);

    // 3. Handle Vote
    const handleVote = async (optionId) => {
        if (!deviceId) return;

        try {
            await axios.post(`${API_URL}/battle/${battleId}/vote`, {
                optionId,
                deviceId
            });
            // Force immediate refresh
            const res = await axios.get(`${API_URL}/battle/${battleId}`, {
                params: { deviceId }
            });
            setBattleData(res.data);
        } catch (error) {
            alert("Error voting. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
                <div className="text-xl text-red-500">{error}</div>
                <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
            </div>
        );
    }

    if (!battleData) return <div className="text-white">Failed to load battle.</div>;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <div className="absolute top-4 left-4 z-50">
                <Link to="/" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    ← Back
                </Link>
            </div>
            <BattleArena
                options={battleData.options}
                totalVotes={battleData.totalVotes}
                userVote={battleData.userVote}
                onVote={handleVote}
                battleName={battleData.name}
            />
        </div>
    );
}

export default BattlePage;
