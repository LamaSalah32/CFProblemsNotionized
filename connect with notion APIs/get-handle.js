const dotenv = require('dotenv');
const { Client } = require('@notionhq/client');

dotenv.config({ path: '../.env' });

exports.getHandle = async (blockId) => {
  const notion = new Client({ auth: process.env.NOTION_KEY });

  const res = await notion.blocks.retrieve({
    block_id: blockId,
  });

  return res.callout.rich_text[0].text.content;
};
