import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShareButton } from './ShareButton';
import API_URL from '../api/config';

// Sounds
import popSound from '../assets/sounds/pop.wav';
import cheerSound from '../assets/sounds/cheer.mp3';

export function BattleArena({ options, onVote, userVote, totalVotes, battleName }) {
    const [left, right] = options;
    const leftPercent = left.percentage || 50;
    const rightPercent = right.percentage || 50;
    const prevUserVote = useRef(userVote);

    // Motion values
    const leftFlex = useMotionValue(50);
    const rightFlex = useMotionValue(50);

    // Sounds
    const [playPop] = useSound(popSound, { volume: 0.5 });
    const [playCheer] = useSound(cheerSound, { volume: 0.5 });

    // Track intro
    const [introFinished, setIntroFinished] = useState(false);

    useEffect(() => {
        const sequence = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // Intro: Red Pushes (Aggressive)
            const pushTransition = { duration: 0.5, ease: "backOut" };
            animate(leftFlex, 75, pushTransition);
            await animate(rightFlex, 25, pushTransition);

            // Intro: Blue Pushes (Aggressive)
            await new Promise(resolve => setTimeout(resolve, 100));
            animate(leftFlex, 25, pushTransition);
            await animate(rightFlex, 75, pushTransition);

            // Settle (Bouncy Spring)
            await new Promise(resolve => setTimeout(resolve, 200));
            const settleTransition = { type: "spring", stiffness: 120, damping: 10, mass: 1 }; // Bouncier!

            animate(leftFlex, leftPercent, settleTransition);
            animate(rightFlex, rightPercent, settleTransition);

            setIntroFinished(true);
        };

        sequence();
    }, []);

    // Sync props with bouncy physics
    useEffect(() => {
        if (introFinished) {
            // More "alive" spring settings
            const updateTransition = { type: "spring", stiffness: 100, damping: 12, mass: 0.8 };
            animate(leftFlex, leftPercent, updateTransition);
            animate(rightFlex, rightPercent, updateTransition);
        }
    }, [leftPercent, rightPercent, introFinished, leftFlex, rightFlex]);

    // Effect: Confetti & Sound on New Vote
    useEffect(() => {
        // If user just voted (state changed from null/other to something)
        if (userVote && userVote !== prevUserVote.current) {
            playCheer();

            // Determine winner color for confetti
            const color = userVote === left.id ? '#ef4444' : '#3b82f6'; // Red or Blue

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [color, '#ffffff']
            });
        }
        prevUserVote.current = userVote;
    }, [userVote, left.id, playCheer]);

    const handleVote = (id) => {
        playPop();
        onVote(id);
    };

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-gray-900 text-white overflow-hidden relative">
            <ShareButton options={options} />

            <h1 className="absolute top-4 md:top-8 left-0 right-0 text-center text-2xl md:text-4xl font-bold z-20 drop-shadow-lg uppercase tracking-widest pointer-events-none mix-blend-overlay">
                {battleName || "Batalla de Colores"}
            </h1>

            {/* LEFT SIDE (Red) */}
            <motion.div
                className="relative flex flex-col items-center justify-center cursor-pointer group w-full md:h-full bg-red-500 overflow-hidden"
                style={{ flex: leftFlex }}
                onClick={() => handleVote(left.id)}
                onMouseEnter={() => playPop()}
                whileHover={{ scale: 1.05, zIndex: 20 }} // More dramatic hover
                whileTap={{ scale: 0.95 }}
            >
                <div className="text-center p-4 z-10 pt-12 md:pt-4">
                    <span className="text-4xl md:text-6xl mb-2 md:mb-4 block shadow-sm transform group-hover:scale-125 transition-transform duration-300">🔴</span>
                    <h2 className="text-xl md:text-3xl font-bold uppercase drop-shadow-md">{left.name}</h2>
                    <div className="text-lg md:text-xl mt-1 md:mt-2 font-mono font-bold opacity-90">{left.percentage}%</div>
                    <div className="text-xs md:text-sm opacity-75">{left.votes} votos</div>

                    {userVote === left.id && (
                        <div className="mt-2 md:mt-4 bg-white text-red-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg inline-block animate-[bounce_1s_infinite]">
                            Has Votado
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.div>

            {/* VS BADGE */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white text-black rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-black text-sm md:text-xl border-4 border-gray-900 shadow-xl pointer-events-none transition-transform hover:scale-110">
                VS
            </div>

            {/* RIGHT SIDE (Blue) */}
            <motion.div
                className="relative flex flex-col items-center justify-center cursor-pointer group w-full md:h-full bg-blue-500 overflow-hidden"
                style={{ flex: rightFlex }}
                onClick={() => handleVote(right.id)}
                onMouseEnter={() => playPop()}
                whileHover={{ scale: 1.05, zIndex: 20 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="text-center p-4 z-10 pb-12 md:pb-4">
                    <span className="text-4xl md:text-6xl mb-2 md:mb-4 block shadow-sm transform group-hover:scale-125 transition-transform duration-300">🔵</span>
                    <h2 className="text-xl md:text-3xl font-bold uppercase drop-shadow-md">{right.name}</h2>
                    <div className="text-lg md:text-xl mt-1 md:mt-2 font-mono font-bold opacity-90">{right.percentage}%</div>
                    <div className="text-xs md:text-sm opacity-75">{right.votes} votos</div>

                    {userVote === right.id && (
                        <div className="mt-2 md:mt-4 bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg inline-block animate-[bounce_1s_infinite]">
                            Has Votado
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-xs md:text-sm opacity-60 z-20 pointer-events-none mix-blend-overlay">
                Votos Totales: {totalVotes}
            </div>
        </div>
    );
}
