const { Client } = require('@notionhq/client');

exports.getHandle = async (notionKey, blockId) => {
  const notion = new Client({ auth: notionKey});

  const res = await notion.blocks.retrieve({
    block_id: blockId,
  });

  return res.callout.rich_text[0].text.content;
};
