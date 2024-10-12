const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Access environment variables for groupId and ROBLOSECURITY cookie
const groupId = process.env.GROUP_ID;  // Set this in Render's environment variables
const robloxCookie = process.env.ROBLOSECURITY;  // Set this in Render's environment variables

// Root route (GET /)
app.get('/', (req, res) => {
    res.send('Hello, this is the root of the API!');
});

// POST route to handle rank changes
app.post('/set-rank', async (req, res) => {
    const { userId, rankId } = req.body;

    try {
        // Send the POST request to Roblox Group API to change the rank
        const response = await axios.post(
            `https://groups.roblox.com/v1/groups/${groupId}/users/${userId}/rank`,
            {
                roleId: rankId
            },
            {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${robloxCookie}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Send a success response back to the client
        res.json({ message: `Rank ${rankId} successfully applied to user ${userId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to change rank' });
    }
});

// Start the server on the provided port or 3000 by default
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
