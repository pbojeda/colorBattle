import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReactionBar = ({ battleId, fingerprint, socket }) => {
    // Default fallback emojis
    const [emojis] = useState(['🔥', '😂', '💩', '❤️', '😱', '🎉', '😡', '🤔', '👍', '👎']);
    const [animations, setAnimations] = useState([]);

    const triggerAnimation = React.useCallback((emoji) => {
        const id = Date.now() + Math.random();
        // Spaced out X positions
        const xPos = 10 + Math.random() * 80;
        setAnimations(prev => [...prev, { id, emoji, x: xPos }]);

        // Cleanup after animation finishes
        setTimeout(() => {
            setAnimations(prev => prev.filter(anim => anim.id !== id));
        }, 3000);
    }, []);

    // Listen for incoming reactions to animate
    useEffect(() => {
        const handleNewReaction = (reaction) => {
            if (reaction.battleId === battleId) {
                triggerAnimation(reaction.type);
            }
        };

        if (socket) {
            socket.on('battle:new_reaction', handleNewReaction);
            return () => {
                socket.off('battle:new_reaction', handleNewReaction);
            };
        }
    }, [battleId, socket, triggerAnimation]);

    const handleReaction = async (emoji) => {
        // Optimistic UI update for ourselves
        triggerAnimation(emoji);

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/battles/${battleId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fingerprint,
                    type: emoji
                })
            });
        } catch (err) {
            console.error("Failed to send reaction", err);
        }
    };

    return (
        <>
            {/* Global Floating Animations Layer - High Z-Index */}
            <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
                <AnimatePresence>
                    {animations.map(anim => (
                        <motion.div
                            key={anim.id}
                            initial={{ y: '110vh', opacity: 0, x: `${anim.x}vw`, scale: 0.5 }}
                            animate={{
                                y: '-10vh',
                                opacity: [0, 1, 1, 0],
                                scale: [0.5, 1.5, 2, 2.5],
                                rotate: [0, 10, -10, 0]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3, ease: "linear" }}
                            className="absolute text-5xl will-change-transform select-none drop-shadow-2xl"
                        >
                            {anim.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Vertical Reaction Bar - Fixed Right Side */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[90] flex flex-col items-center">
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-full py-4 px-2.5 flex flex-col gap-3 shadow-2xl items-center w-[50px] md:w-[60px]"
                >
                    <div className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 rotate-180 [writing-mode:vertical-lr] hidden md:block">
                        REACCIONAR
                    </div>
                    {emojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="text-2xl md:text-3xl hover:scale-150 transition-all active:scale-75 hover:bg-white/10 rounded-full p-1 flex items-center justify-center w-full"
                        >
                            {emoji}
                        </button>
                    ))}
                </motion.div>
            </div>
        </>
    );
};

export default ReactionBar;
