const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const GROUP_ID = process.env.GROUP_ID; // Get group ID from .env
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY; // Get API key from .env

async function setRank(userId, rankId) {
    try {
        const response = await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            {
                role: rankId
            },
            {
                headers: {
                    'x-api-key': ROBLOX_API_KEY
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error setting rank:", error);
        throw error;
    }
}

app.post('/setRank', async (req, res) => {
    const { userId, rankId } = req.body;

    try {
        const result = await setRank(userId, rankId);
        res.status(200).json({ message: "Rank changed successfully", result });
    } catch (error) {
        res.status(500).json({ error: "Failed to change rank" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
