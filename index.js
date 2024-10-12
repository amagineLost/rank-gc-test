require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const GROUP_ID = process.env.GROUP_ID;
const ROBLOX_COOKIE = process.env.ROBLOSECURITY; // Use the ROBLOSECURITY environment variable

let csrfToken = '';

// Function to get CSRF Token
async function getCsrfToken() {
    try {
        const response = await axios.post(
            `https://auth.roblox.com/v1/login`, // This endpoint gives us a CSRF token without logging in
            {},
            {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${ROBLOX_COOKIE}`
                }
            }
        );
        csrfToken = response.headers['x-csrf-token'];
        console.log("CSRF Token fetched successfully");
    } catch (error) {
        if (error.response && error.response.headers['x-csrf-token']) {
            csrfToken = error.response.headers['x-csrf-token'];
            console.log("CSRF Token from error response:", csrfToken);
        } else {
            console.error('Failed to fetch CSRF token:', error.message);
            throw error;
        }
    }
}

// Function to set rank on Roblox group
async function setRank(userId, rankId) {
    await getCsrfToken(); // Ensure we have the CSRF token
    try {
        console.log(`Sending rank change request for userId: ${userId}, rankId: ${rankId}`);
        const response = await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            { role: rankId },
            {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${ROBLOX_COOKIE}`, // Add the ROBLOSECURITY cookie to the request headers
                    'X-CSRF-Token': csrfToken, // Use the fetched CSRF token
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
