import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useParams, Link } from 'react-router-dom';
import { BattleArena } from '../components/BattleArena';
import Chat from '../components/Social/Chat';
import ReactionBar from '../components/Social/ReactionBar';
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
    const [socket, setSocket] = useState(null);

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
        const newSocket = io(API_URL_BASE);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            newSocket.emit('join_battle', battleId);
        });

        newSocket.on('vote_update', (newData) => {
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
            newSocket.disconnect();
            setSocket(null);
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

    // 4. Handle Meme Generation
    const [showMemeModal, setShowMemeModal] = useState(false);
    const [memeUrl, setMemeUrl] = useState(null);
    const [generatingMeme, setGeneratingMeme] = useState(false);

    const handleGenerateMeme = async () => {
        if (memeUrl) {
            setShowMemeModal(true);
            return;
        }

        setGeneratingMeme(true);
        setShowMemeModal(true); // Show modal immediately with loading state

        try {
            // Request Blob to handle image data
            const res = await axios.get(`${API_URL}/battle/${battleId}/meme`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            setMemeUrl(url);
        } catch (error) {
            console.error("Error generating meme:", error);
            alert("Failed to generate meme. AI might be busy!");
            setShowMemeModal(false);
        } finally {
            setGeneratingMeme(false);
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
        <div className="fixed inset-0 w-screen overflow-hidden">
            {/* Social Components */}
            {socket && deviceId && (
                <>
                    <Chat battleId={battleId} fingerprint={deviceId} socket={socket} battleData={battleData} />
                    <ReactionBar battleId={battleId} fingerprint={deviceId} socket={socket} />
                </>
            )}

            <div className="absolute top-4 left-4 z-50">
                <Link to="/" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    ← Volver
                </Link>
            </div>

            <BattleArena
                options={battleData.options}
                totalVotes={battleData.totalVotes}
                userVote={battleData.userVote}
                onVote={handleVote}
                battleName={battleData.name}
                theme={battleData.theme}
                onGenerateMeme={handleGenerateMeme}
            />

            {/* Meme Modal */}
            {showMemeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowMemeModal(false)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowMemeModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white bg-gray-800 rounded-full p-2"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-white mb-4 text-center">Generador de Memes IA 🤖</h3>

                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                            {generatingMeme ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                    <p className="text-gray-300 animate-pulse">Cocinando un meme picante...</p>
                                    <p className="text-xs text-gray-500 mt-2">(Llamando a la IA para que cuente chistes)</p>
                                </div>
                            ) : memeUrl ? (
                                <div className="flex flex-col gap-4 w-full">
                                    <img src={memeUrl} alt="Meme Generado por IA" className="w-full rounded-lg shadow-lg border border-gray-700" />
                                    <div className="flex gap-2 justify-center">
                                        <a
                                            href={memeUrl}
                                            download={`meme-${battleId}.jpg`}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex-1 text-center"
                                        >
                                            💾 Descargar
                                        </a>
                                        {navigator.share && (
                                            <button
                                                onClick={() => navigator.share({ title: 'Meme IA', text: '¡Mira esto!', url: window.location.href, files: [new File([memeUrl], 'meme.jpg', { type: 'image/jpeg' })] }).catch(() => { })}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex-1"
                                            >
                                                🚀 Compartir
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-red-400">Something went wrong.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BattlePage;
