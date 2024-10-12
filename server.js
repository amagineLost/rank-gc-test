const express = require('express');
const axios = require('axios');
const app = express();

const groupId = 'YOUR_GROUP_ID'; // Replace with your Roblox group ID
const apiKey = 'YOUR_ROBLOX_API_KEY'; // Replace with your Roblox API key

app.use(express.json());

// API to handle rank changes
app.post('/set-rank', async (req, res) => {
    const { userId, rankId } = req.body;

    try {
        const response = await axios.post(
            `https://groups.roblox.com/v1/groups/${groupId}/users/${userId}/rank`,
            {
                roleId: rankId
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );
        res.json({ message: 'Rank changed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to change rank' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
