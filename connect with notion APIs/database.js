const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
const { getHandle } = require('./get-handle');

dotenv.config({ path: '../.env' });

const notion = new Client({ auth: process.env.NOTION_KEY });

const updatePage = async (pageId, updateStatus) => {
  const notion = new Client({ auth: process.env.NOTION_KEY });

  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          rich_text: [
            {
              text: { content: updateStatus },
              annotations: {
                color: updateStatus === 'SOLVED ✅️' ? 'green' : 'default',
                bold: true,
              },
            },
          ],
        },
      },
    });
  } catch (error) {
    console.error(`Error updating page ${pageId} status:`, error);
    throw error;
  }
};

const deletePage = async (pageId) => {
  const notion = new Client({ auth: process.env.NOTION_KEY });

  try {
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    console.log(`Page with ID ${pageId} has been deleted.`);
  } catch (error) {
    console.error(`Error deleting page with ID ${pageId}:`, error);
    throw error;
  }
};

const createPage = async (page, databaseId, handle) => {
  const notion = new Client({ auth: process.env.NOTION_KEY });

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      'Problem name': {
        title: [{ text: { content: page['Problem_name'] } }],
      },
      'University': { rich_text: [{ text: { content: page['University'] } }] },
      'Link': { url: page.Link },
      'Status': {
        rich_text: [
          {
            text: { content: page.Status },
            annotations: {
              color: page.Status === 'UNSOLVED' ? 'red' : 'default',
              bold: true,
            },
          },
        ],
      },
      '#': {
        rich_text: [
          {
            text: { content: page.value },
            annotations: { bold: true },
          },
        ],
      },
      'Handle': {
        rich_text: [
          {
            text: { content: handle },
            annotations: { color: 'gray' },
          },
        ],
      },
    },
  });

  console.log(page);
};

const checkExistingPage = async (link, databaseId) => {
  const notion = new Client({ auth: process.env.NOTION_KEY });

  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Link',
      url: {
        contains: link,
      },
    },
  });

  if (results.length > 0) {
    const handle = results[0].properties.Handle.rich_text[0].plain_text;
    return { pageId: results[0].id, pageHandle: handle };
  } else {
    return { pageId: 0, pageHandle: 0 };
  }
};

exports.addProblems = async (page, databaseId) => {
  const handle = await getHandle(process.env.NOTION_HANDLE_BLOCK_ID);
  const operations = [];

  try {
    let { pageId, pageHandle } = await checkExistingPage(page.Link, databaseId);

    if (pageId && pageHandle != handle) {
      operations.push(deletePage(pageId));
      pageId = 0;
    }

    if (pageId) {
      operations.push(updatePage(pageId, 'dsfj'));
    } else {
      operations.push(createPage(page, databaseId, handle));
    }
  } catch (error) {
    console.error('Error adding problem:', error);
  }

  await Promise.all(operations);
};

exports.fetchChallengeLinks = async (databaseId) => {
  const notion = new Client({ auth: process.env.NOTION_KEY });

  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
    });

    return results.map((record) => {
      const challenge = {};

      Object.entries(record.properties).forEach(([key, value]) => {
        if (value.type === 'title') {
          challenge.university = value.title[0].text.content;
        } else {
          challenge[key.toLowerCase()] = value.url;
        }
      });

      return challenge;
    });
  } catch (error) {
    console.error('Error fetching challenge links:', error);
    throw error;
  }
};
