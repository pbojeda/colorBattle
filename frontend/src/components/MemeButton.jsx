import React from 'react';
import { motion } from 'framer-motion';

export function MemeButton({ onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="absolute top-4 right-16 z-50 p-3 rounded-full bg-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-lg text-purple-200 hover:bg-purple-600/40 hover:text-white transition-colors"
            title="Generar Meme IA"
        >
            <span className="text-xl">😂</span>
        </motion.button>
    );
}
