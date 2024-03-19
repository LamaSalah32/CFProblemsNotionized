// Import required modules
const dotenv = require('dotenv');
const links = require('./fetchProblems.js');
const { addProblems } = require('./connect with notion APIs/database.js');

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Define async function to handle the problem
async function problem() {
  try {
    // Fetch problems
    const problemData = await links.fetchProblems();

    // Parallelize adding problems
    const addPromises = problemData.map(page =>
      addProblems(page, process.env.NOTION_PROBLEMS_DATABASE_ID)
    );

    await Promise.all(addPromises);

    console.log('All pages created successfully');
  } catch (error) {
    console.error('Error creating page:', error);
  }
}

module.exports = problem;
