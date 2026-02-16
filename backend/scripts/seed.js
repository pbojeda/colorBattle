require('dotenv').config();
const mongoose = require('mongoose');
const Battle = require('../models/Battle');

// Hardcoded themes for seed data to avoid API Rate Limits during dev/test
const SEED_THEMES = {
    'Rojos Vs Fachas': { optionAColor: '#ef4444', optionBColor: '#fcd34d', background: 'linear-gradient(to right, #7f1d1d, #78350f)' }, // Red vs Gold(ish)
    'Plátano vs Fresa': { optionAColor: '#facc15', optionBColor: '#ef4444', background: 'linear-gradient(to right, #fffbeb, #fee2e2)' }, // Yellow vs Red
    'Verano vs Invierno': { optionAColor: '#f97316', optionBColor: '#3b82f6', background: 'linear-gradient(to right, #ffedd5, #dbeafe)' }, // Orange vs Blue
    'Perros vs Gatos': { optionAColor: '#8b5cf6', optionBColor: '#10b981', background: 'linear-gradient(to right, #4c1d95, #064e3b)' }, // Purple vs Green
    'Tortilla con Cebolla vs Tortilla sin Cebolla': { optionAColor: '#eab308', optionBColor: '#a8a29e', background: 'linear-gradient(to right, #fefce8, #f5f5f4)' },
    'Madrugar vs Trasnochar': { optionAColor: '#0ea5e9', optionBColor: '#4f46e5', background: 'linear-gradient(to right, #0c4a6e, #312e81)' },
    'Playa vs Montaña': { optionAColor: '#06b6d4', optionBColor: '#22c55e', background: 'linear-gradient(to right, #ecfeff, #f0fdf4)' },
    'Café vs Té': { optionAColor: '#78350f', optionBColor: '#10b981', background: 'linear-gradient(to right, #fff7ed, #ecfdf5)' },
    'iOS vs Android': { optionAColor: '#9ca3af', optionBColor: '#a3e635', background: 'linear-gradient(to right, #f3f4f6, #f7fee7)' },
    'Marvel vs DC': { optionAColor: '#ef4444', optionBColor: '#1e40af', background: 'linear-gradient(to right, #fee2e2, #dbeafe)' },
};

const optionsPool = [
    { left: 'Plátano', right: 'Fresa' },
    { left: 'Verano', right: 'Invierno' },
    { left: 'Perros', right: 'Gatos' },
    { left: 'Tortilla con Cebolla', right: 'Tortilla sin Cebolla' },
    { left: 'Madrugar', right: 'Trasnochar' },
    { left: 'Playa', right: 'Montaña' },
    { left: 'Café', right: 'Té' },
    { left: 'iOS', right: 'Android' },
    { left: 'Marvel', right: 'DC' },
];

const seedBattles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing battles
        await Battle.deleteMany({});
        console.log('Cleared existing battles.');

        // Specific Battle: Rojos Vs Fachas (Trending #1)
        const specificBattle = new Battle({
            name: 'Rojos Vs Fachas',
            battleId: 'rojos-vs-fachas',
            theme: SEED_THEMES['Rojos Vs Fachas'],
            options: [
                { id: 'opt1', name: 'Rojos', votes: 1500 },
                { id: 'opt2', name: 'Fachas', votes: 1200 }
            ],
            votes: {}
        });
        await specificBattle.save();
        console.log('Created: Rojos Vs Fachas (Trending #1)');

        console.log(`Seeding ${optionsPool.length} random battles...`);

        for (const pair of optionsPool) {
            const battleName = `${pair.left} vs ${pair.right}`;
            const battleId = battleName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

            const votesLeft = Math.floor(Math.random() * 500);
            const votesRight = Math.floor(Math.random() * 500);

            // Use hardcoded theme or fallback to Red/Blue if missing
            const theme = SEED_THEMES[battleName] || {
                optionAColor: '#ef4444',
                optionBColor: '#3b82f6',
                background: 'linear-gradient(to right, #1f2937, #111827)'
            };

            const newBattle = new Battle({
                name: battleName,
                battleId,
                theme,
                options: [
                    { id: 'opt1', name: pair.left, votes: votesLeft },
                    { id: 'opt2', name: pair.right, votes: votesRight }
                ],
                votes: {}
            });

            await newBattle.save();
            console.log(`Seeded: ${battleName}`);
        }

        console.log('Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedBattles();
