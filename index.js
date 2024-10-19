require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const GROUP_ID = process.env.GROUP_ID;
const ROBLOX_COOKIE = process.env.ROBLOX_TOKEN; // Renamed for clarity (ROBLOX_TOKEN)

// Log to confirm server start
console.log('Starting server...');

// Function to get CSRF Token
async function getCsrfToken() {
    try {
        const response = await axios.post('https://auth.roblox.com/v2/logout', {}, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${ROBLOX_COOKIE}`,
            },
        });
        return response.headers['x-csrf-token'];
    } catch (error) {
        if (error.response && error.response.status === 403) {
            return error.response.headers['x-csrf-token'];
        } else {
            console.error('Failed to get CSRF token:', error.message);
            throw error;
        }
    }
}

// Function to retrieve userId from username
async function getUserIdFromUsername(username) {
    try {
        const userIdResponse = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${username}`);
        if (userIdResponse.data.data.length === 0) {
            throw new Error('Player not found');
        }
        return userIdResponse.data.data[0].id;
    } catch (error) {
        console.error(`Error fetching userId for username ${username}:`, error.message);
        throw error;
    }
}

// Function to retrieve roleId from role name
async function getRoleIdFromRoleName(roleName) {
    try {
        const rolesResponse = await axios.get(`https://groups.roblox.com/v1/groups/${GROUP_ID}/roles`);
        const role = rolesResponse.data.roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        if (!role) {
            throw new Error('Role not found');
        }
        return role.id;
    } catch (error) {
        console.error(`Error fetching roleId for role name ${roleName}:`, error.message);
        throw error;
    }
}

// Function to set rank on Roblox group
async function setRank(userId, roleId) {
    const csrfToken = await getCsrfToken(); // Ensure we have the CSRF token
    try {
        console.log(`Sending rank change request for userId: ${userId}, roleId: ${roleId}`);
        const response = await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            { roleId }, // Correct key name is roleId, not rankId
            {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${ROBLOX_COOKIE}`,
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("Rank change response:", response.data);
        return response.data;
    } catch (error) {
        // Handle roleset invalid error
        if (error.response && error.response.data.errors && error.response.data.errors[0].code === 2) {
            console.error("Invalid roleset or role does not exist. Please check your roleId.");
            throw new Error('The roleset is invalid or does not exist.');
        }

        // If CSRF token is invalid, retry with a new token
        if (error.response && error.response.status === 403 && error.response.data.errors[0].code === 1) {
            console.log("Invalid CSRF Token, retrying...");
            return setRank(userId, roleId); // Retry the request
        }

        console.error("Error setting rank:", error.response ? error.response.data : error.message);
        throw error;
    }
}

// POST endpoint to change rank based on username and role name
app.post('/setRank', async (req, res) => {
    const { username, roleName } = req.body;

    if (!username || !roleName) {
        return res.status(400).json({ error: "Missing username or roleName" });
    }

    try {
        console.log(`Received request to set role for ${username} to ${roleName}`);

        // Get userId from username
        const userId = await getUserIdFromUsername(username);
        console.log(`Retrieved user ID ${userId} for player ${username}`);

        // Get roleId from role name
        const roleId = await getRoleIdFromRoleName(roleName);
        console.log(`Role ID for ${roleName}: ${roleId}`);

        // Set rank (role) using userId and roleId
        const result = await setRank(userId, roleId);
        res.status(200).json({ message: `Role for ${username} updated to ${roleName}`, result });
    } catch (error) {
        res.status(500).json({ error: "Failed to set role", details: error.message });
    }
});

// Root route to verify the server is running
app.get('/', (req, res) => {
    res.send('Rank change server is running.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
