// Import required modules
const dotenv = require('dotenv');
const problem = require('./problemHandler');

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Call the main function
problem();
