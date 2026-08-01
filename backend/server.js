// Load environment variables
require("dotenv").config();

// Import the Express app
const app = require("./src/app");

// Get port from .env
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});