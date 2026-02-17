import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = ({ battleId, fingerprint, socket, battleData }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [nickname, setNickname] = useState('');
    const [isNicknameSet, setIsNicknameSet] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const chatContainerRef = useRef(null);

    // Helpers for colors based on theme
    const getOptionColor = (optionId) => {
        if (!battleData) return 'rgba(59, 130, 246, 0.5)'; // default blue
        const option = battleData.options.find(o => o.id === optionId);
        if (!option) return 'rgba(156, 163, 175, 0.5)'; // gray for neutral

        // Find if it's optionA or optionB from theme
        const isA = battleData.options[0]?.id === optionId;
        return isA ? battleData.theme.optionAColor : battleData.theme.optionBColor;
    };

    // Fetch initial messages
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/battles/${battleId}/comments`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error(err));

        const handleNewMessage = (msg) => {
            if (msg.battleId === battleId) {
                setMessages(prev => [msg, ...prev]);
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        };

        socket.on('chat:new_message', handleNewMessage);

        return () => {
            socket.off('chat:new_message', handleNewMessage);
        };
    }, [battleId, socket]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const body = {
                fingerprint,
                content: newMessage,
                nickname: nickname.trim() || undefined
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/battles/${battleId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const sentMsg = await res.json();
                if (sentMsg.nickname) {
                    setNickname(sentMsg.nickname);
                    setIsNicknameSet(true);
                }
                setNewMessage('');
            } else {
                const error = await res.json();
                alert(error.error || "Failed to send message");
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
                        className="pointer-events-auto bg-gray-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] mb-4 w-[calc(100vw-2rem)] xs:w-[350px] max-h-[50vh] sm:max-h-[70vh] flex flex-col overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="bg-white/5 p-5 border-b border-white/10 flex justify-between items-center relative z-10">
                            <div>
                                <h1 className="font-black tracking-tight text-white text-base">CHATEÁ EN VIVO</h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Batalla Online</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/40 hover:text-white transition-colors p-2"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto px-5 py-4 space-y-5 flex flex-col scroll-smooth relative z-10 no-scrollbar"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        key={msg._id || index}
                                        className={`flex flex-col ${msg.fingerprint === fingerprint ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`flex items-center gap-2 mb-1 px-1 ${msg.fingerprint === fingerprint ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="font-bold text-[9px] uppercase text-gray-400">
                                                {msg.nickname}
                                            </span>
                                            {msg.team && (
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: getOptionColor(msg.team), boxShadow: `0 0 10px ${getOptionColor(msg.team)}` }}
                                                ></span>
                                            )}
                                        </div>
                                        <div
                                            className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg border
                                                ${msg.fingerprint === fingerprint
                                                    ? 'bg-blue-600/30 border-blue-500/30 text-white rounded-tr-none'
                                                    : 'bg-white/10 border-white/5 text-gray-200 rounded-tl-none'}`}
                                            style={msg.team ? {
                                                borderLeft: msg.fingerprint !== fingerprint ? `2.5px solid ${getOptionColor(msg.team)}` : undefined,
                                                borderRight: msg.fingerprint === fingerprint ? `2.5px solid ${getOptionColor(msg.team)}` : undefined
                                            } : {}}
                                        >
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div className="p-5 bg-white/5 border-t border-white/10 relative z-10 backdrop-blur-md">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                {!isNicknameSet ? (
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="Tu Apodo..."
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="w-full bg-white/5 text-white text-base md:text-[11px] p-3 rounded-xl border border-white/10 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <span className="text-[10px] text-blue-300 font-bold uppercase">{nickname}</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsNicknameSet(false)}
                                            className="text-[9px] text-white/40 hover:text-white font-bold uppercase underline"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribí algo..."
                                        className="flex-1 bg-white/5 text-white text-base md:text-xs p-3 rounded-xl border border-white/10 focus:border-blue-500/50 focus:outline-none transition-all placeholder:text-white/20"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white w-10 h-10 rounded-xl transition-all flex items-center justify-center active:scale-90 shadow-lg"
                                    >
                                        →
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    layout
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="pointer-events-auto bg-blue-600 text-white w-14 h-14 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center text-2xl"
                >
                    💬
                </motion.button>
            )}
        </div>
    );
};

export default Chat;
