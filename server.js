const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const groupId = process.env.GROUP_ID;  // Set this in Render's environment variables
const robloxCookie = process.env.ROBLOSECURITY;  // Set this in Render's environment variables

app.post('/set-rank', async (req, res) => {
    const { userId, rankId } = req.body;

    try {
        // Attempt to send the POST request to Roblox Group API to change the rank
        const response = await axios.post(
            `https://groups.roblox.com/v1/groups/${groupId}/users/${userId}/rank`,
            { roleId: rankId },
            {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${robloxCookie}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json({ message: `Rank ${rankId} successfully applied to user ${userId}` });
    } catch (error) {
        // Log detailed error information
        console.error("Error changing rank:", error.response ? error.response.data : error.message);
        
        // Send the error details back in the response (for debugging)
        res.status(500).json({
            error: 'Failed to change rank',
            details: error.response ? error.response.data : error.message,
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
