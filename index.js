const dotenv = require('dotenv');
const express = require('express');
const { problem } = require('./problemsHandler');

const App = express()

dotenv.config({ path: '.env' });

problem(
  process.env.NOTION_KEY,
  process.env.NOTION_PROBLEMS_DATABASE_ID,
  process.env.NOTION_CHALLENGES_LINKS_DATABASE_ID,
  process.env.NOTION_HANDLE_BLOCK_ID
);

module.exports = App;