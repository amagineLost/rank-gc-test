require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const GROUP_ID = process.env.GROUP_ID;
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;

// Function to set rank on Roblox group
async function setRank(userId, rankId) {
    try {
        console.log(`Attempting to set rank for userId: ${userId}, rankId: ${rankId}`);
        const response = await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            { role: rankId },
            {
                headers: {
                    'x-api-key': ROBLOX_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("Rank change response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error setting rank:", error.response ? error.response.data : error.message);
        throw error;
    }
}

// POST endpoint to change rank
app.post('/setRank', async (req, res) => {
    const { userId, rankId } = req.body;
    if (!userId || !rankId) {
        return res.status(400).json({ error: "Missing userId or rankId" });
    }
    try {
        const result = await setRank(userId, rankId);
        res.status(200).json({ message: "Rank changed successfully", result });
    } catch (error) {
        res.status(500).json({ error: "Failed to change rank", details: error.message });
    }
});

// Test route to verify the server is running
app.get('/', (req, res) => {
    res.send("Rank change server is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
