const express = require('express');
const axios = require('axios');
const app = express();

const groupId = '34739953';  // Replace with your Roblox group ID
const robloxCookie = process.env.ROBLOSECURITY;  // Environment variable for security

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
                    'Cookie': `.ROBLOSECURITY=${robloxCookie}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        res.json({ message: 'Rank changed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to change rank' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
