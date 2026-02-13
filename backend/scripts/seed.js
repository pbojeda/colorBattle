const mongoose = require('mongoose');
const Battle = require('../models/Battle');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const optionsPool = [
    { left: 'Pizza con Piña', right: 'Pizza sin Piña' },
    { left: 'Verano', right: 'Invierno' },
    { left: 'Perros', right: 'Gatos' },
    { left: 'Tortilla con Cebolla', right: 'Tortilla sin Cebolla' },
    { left: 'Madrugar', right: 'Trasnochar' },
    { left: 'Playa', right: 'Montaña' },
    { left: 'Café', right: 'Té' },
    { left: 'iOS', right: 'Android' },
    { left: 'Star Wars', right: 'Star Trek' },
    { left: 'Marvel', right: 'DC' },
    { left: 'Cine', right: 'Netflix' },
    { left: 'Libro', right: 'E-book' },
    { left: 'Llamada', right: 'Mensaje' },
    { left: 'Dulce', right: 'Salado' },
    { left: 'Vino', right: 'Cerveza' },
];

const seedBattles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing battles
        await Battle.deleteMany({});
        console.log('Cleared existing battles.');

        // Specific Battle: Rojos Vs Fachas
        const specificBattle = new Battle({
            name: 'Rojos Vs Fachas',
            battleId: 'rojos-vs-fachas',
            options: [
                { id: 'opt1', name: 'Rojos', votes: 100 },
                { id: 'opt2', name: 'Fachas', votes: 100 }
            ],
            votes: {}
        });
        await specificBattle.save();
        console.log('Created specific battle: Rojos Vs Fachas');

        const battlesToCreate = 29; // 30 total
        console.log(`Seeding ${battlesToCreate} random battles...`);

        for (let i = 0; i < battlesToCreate; i++) {
            const pair = optionsPool[Math.floor(Math.random() * optionsPool.length)];
            const uniqueSuffix = Math.floor(Math.random() * 10000);
            const battleName = `${pair.left} vs ${pair.right}`;
            const battleId = battleName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uniqueSuffix;

            const votesLeft = Math.floor(Math.random() * 500);
            const votesRight = Math.floor(Math.random() * 500);

            const newBattle = new Battle({
                name: battleName,
                battleId,
                options: [
                    { id: 'opt1', name: pair.left, votes: votesLeft },
                    { id: 'opt2', name: pair.right, votes: votesRight }
                ],
                votes: {} // No individual vote tracking for seed data to save space/time
            });

            await newBattle.save();
        }

        console.log('Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedBattles();
