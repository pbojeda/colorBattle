const mongoose = require('mongoose');
require('dotenv').config();
const Battle = require('../models/Battle');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const updateBattleTheme = async () => {
    await connectDB();

    // Find battle created earlier
    // Name: "Fallback Fixed"
    // ID: "fallback-fixed-2374" (or similar, checking with regex or just name)

    try {
        const battle = await Battle.findOne({ name: "Fallback Fixed" });
        if (!battle) {
            console.log("Battle not found!");
            process.exit(1);
        }

        console.log(`Found battle: ${battle.name} (${battle.battleId})`);

        // Update Theme to Green vs Purple
        battle.theme = {
            optionAColor: "#10b981", // Emerald-500
            optionBColor: "#8b5cf6", // Violet-500
            background: "linear-gradient(to right, #064e3b, #4c1d95)" // Emerald-900 to Violet-900
        };

        await battle.save();
        console.log("Battle theme updated successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

updateBattleTheme();
