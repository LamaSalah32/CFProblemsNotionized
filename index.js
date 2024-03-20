const dotenv = require('dotenv');
const { problem } = require('./problemsHandler');

dotenv.config({ path: '.env' });

problem(
  process.env.NOTION_KEY,
  process.env.NOTION_PROBLEMS_DATABASE_ID,
  process.env.NOTION_CHALLENGES_LINKS_DATABASE_ID,
  process.env.NOTION_HANDLE_BLOCK_ID
);
