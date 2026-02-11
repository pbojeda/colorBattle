import React from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShareButton } from './ShareButton';
import API_URL from '../api/config';

export function BattleArena({ options, onVote, userVote, totalVotes }) {
    const [left, right] = options;
    const leftPercent = left.percentage || 50;
    const rightPercent = right.percentage || 50;

    // Motion values for the flex grow property
    const leftFlex = useMotionValue(50);
    const rightFlex = useMotionValue(50);

    // Track if intro execution is finished to allow real-time updates
    const [introFinished, setIntroFinished] = React.useState(false);

    React.useEffect(() => {
        const sequence = async () => {
            // Initial delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Phase 1: Red pushes hard (grows to 75%)
            // We use standard animate here for a "power move" feel
            const transition = { duration: 0.6, ease: "backOut" };

            animate(leftFlex, 75, transition);
            await animate(rightFlex, 25, transition);

            // Phase 2: Blue pushes back (grows to 75%, Red shrinks to 25%)
            await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause of tension
            animate(leftFlex, 25, transition);
            await animate(rightFlex, 75, transition);

            // Phase 3: Settle to actual values
            await new Promise(resolve => setTimeout(resolve, 200));
            const settleTransition = { type: "spring", stiffness: 100, damping: 15 };

            animate(leftFlex, leftPercent, settleTransition);
            animate(rightFlex, rightPercent, settleTransition);

            setIntroFinished(true);
        };

        sequence();
    }, []); // Run only on mount

    // Keep motion values in sync with props after intro
    React.useEffect(() => {
        if (introFinished) {
            const updateTransition = { type: "spring", stiffness: 60, damping: 15 };
            animate(leftFlex, leftPercent, updateTransition);
            animate(rightFlex, rightPercent, updateTransition);
        }
    }, [leftPercent, rightPercent, introFinished, leftFlex, rightFlex]);

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-gray-900 text-white overflow-hidden relative">
            <ShareButton options={options} />
            {/* Header Title */}
            <h1 className="absolute top-4 md:top-8 left-0 right-0 text-center text-2xl md:text-4xl font-bold z-20 drop-shadow-lg uppercase tracking-widest pointer-events-none mix-blend-overlay">
                Batalla de Colores
            </h1>

            {/* LEFT / TOP SIDE */}
            <motion.div
                className="relative flex flex-col items-center justify-center cursor-pointer group w-full md:h-full bg-red-500 overflow-hidden"
                style={{
                    flex: leftFlex
                }}
                onClick={() => onVote(left.id)}
                whileHover={{ scale: 1.02, zIndex: 20 }}
            >
                <div className="text-center p-4 z-10 pt-12 md:pt-4"> {/* Added padding top for mobile header clearance */}
                    <span className="text-4xl md:text-6xl mb-2 md:mb-4 block shadow-sm transform group-hover:scale-110 transition-transform">🔴</span>
                    <h2 className="text-xl md:text-3xl font-bold uppercase drop-shadow-md">{left.name}</h2>
                    <div className="text-lg md:text-xl mt-1 md:mt-2 font-mono font-bold opacity-90">{left.percentage}%</div>
                    <div className="text-xs md:text-sm opacity-75">{left.votes} votos</div>

                    {userVote === left.id && (
                        <div className="mt-2 md:mt-4 bg-white text-red-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg inline-block animate-pulse">
                            Has Votado
                        </div>
                    )}
                </div>
                {/* Visual Flair */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.div>

            {/* VS BADGE */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white text-black rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-black text-sm md:text-xl border-4 border-gray-900 shadow-xl pointer-events-none">
                VS
            </div>

            {/* RIGHT / BOTTOM SIDE */}
            <motion.div
                className="relative flex flex-col items-center justify-center cursor-pointer group w-full md:h-full bg-blue-500 overflow-hidden"
                style={{
                    flex: rightFlex
                }}
                onClick={() => onVote(right.id)}
                whileHover={{ scale: 1.02, zIndex: 20 }}
            >
                <div className="text-center p-4 z-10 pb-12 md:pb-4"> {/* Added padding bottom for mobile footer clearance */}
                    <span className="text-4xl md:text-6xl mb-2 md:mb-4 block shadow-sm transform group-hover:scale-110 transition-transform">🔵</span>
                    <h2 className="text-xl md:text-3xl font-bold uppercase drop-shadow-md">{right.name}</h2>
                    <div className="text-lg md:text-xl mt-1 md:mt-2 font-mono font-bold opacity-90">{right.percentage}%</div>
                    <div className="text-xs md:text-sm opacity-75">{right.votes} votos</div>

                    {userVote === right.id && (
                        <div className="mt-2 md:mt-4 bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg inline-block animate-pulse">
                            Has Votado
                        </div>
                    )}
                </div>
                {/* Visual Flair */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-xs md:text-sm opacity-60 z-20 pointer-events-none mix-blend-overlay">
                Votos Totales: {totalVotes}
            </div>
        </div>
    );
}
