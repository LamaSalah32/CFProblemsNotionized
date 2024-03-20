const { Client } = require('@notionhq/client');

exports.createPage = async (NotionKey, page, databaseId) => {
  const notion = new Client({ auth: NotionKey });

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
    },
  });

  console.log(page);
};

const deletePage = async (NotionKey, pageId) => {
  const notion = new Client({ auth: NotionKey });

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

exports.deleteAllPages = async (NotionKey, databaseId) => {
  const notion = new Client({ auth: NotionKey });

  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
    });

    const deletionPromises = results.map((page) =>
      deletePage(NotionKey, page.id)
    );
    await Promise.all(deletionPromises);

    console.log('All pages have been deleted.');
  } catch (error) {
    console.error('Error deleting pages:', error);
    throw error;
  }
};

exports.getLinks = async (NotionKey, databaseId) => {
  const notion = new Client({ auth: NotionKey });

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
