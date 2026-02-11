import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ShareButton({ options }) {
    const [left, right] = options;
    const [showCopied, setShowCopied] = useState(false);

    const handleShare = async () => {
        // Determine the text based on current status
        const leader = left.percentage > right.percentage ? left :
            right.percentage > left.percentage ? right : null;

        let text = "Rojo vs Azul - ¡La Batalla de Colores Definitiva!";
        if (leader) {
            text = `¡Batalla 🔴 vs 🔵! ${leader.name} está ganando con un ${leader.percentage}%! ¡Vota ahora para ayudar a tu equipo!`;
        } else {
            text = "¡Batalla 🔴 vs 🔵! ¡Es un empate técnico! ¡Vota ahora!";
        }

        const url = window.location.origin;
        const shareData = {
            title: 'Batalla de Colores',
            text: text,
            url: url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback for desktop/browsers without Web Share API
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white hover:bg-white/20 transition-colors"
                aria-label="Share"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            </motion.button>

            <AnimatePresence>
                {showCopied && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -10, x: '-50%' }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 text-white text-sm rounded-full backdrop-blur-sm pointer-events-none"
                    >
                        ¡Enlace copiado!
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
