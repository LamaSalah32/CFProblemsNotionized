const axios = require('axios');
const cheerio = require('cheerio');
const { getHandle } = require('./connect with notion APIs/get-handle');
const { getLinks } = require('./connect with notion APIs/database');

const getAllProblem = async (NotionKey, LinksDatabase, BlockId) => {
  try {
    const links = await getLinks(NotionKey, LinksDatabase);
    const allProblems = [];

    const fetchAllProblems = links.map(async (link) => {
      try {
        const response = await axios.get(link.url);

        if (response.status === 200) {
          const html = response.data;
          const $ = cheerio.load(html);
          const optionElements = $('option');

          for (let index = 0; index < optionElements.length; index++) {
            const element = optionElements[index];
            const problemName = $(element).attr('data-problem-name');
            const value = $(element).attr('value');

            if (problemName && value) {
              const verdict = await checkVerdict(
                NotionKey,
                BlockId,
                `${link.url}/status/${value}`
              );
              const url = `${link.url}/problem/${value}`;

              allProblems.push({
                value: value,
                Problem_name: problemName,
                University: link.university,
                Link: url,
                Status: verdict,
              });
            }
          }
        }
      } catch (error) {
        console.error(
          `Error fetching problems for ${link.university}:`,
          error.message
        );
      }
    });

    await Promise.all(fetchAllProblems);
    return allProblems;
  } catch (error) {
    console.log('Error:', error.message);
  }
};

const checkVerdict = async (NotionKey, BlockId, url) => {
  const handle = await getHandle(NotionKey, BlockId);

  let result = 'UNSOLVED';
  try {
    let pageIndex = 1;
    let maxPageIndex = 1;

    while (maxPageIndex >= pageIndex) {
      const pageUrl = `${url}/page/${pageIndex}?order=BY_PROGRAM_LENGTH_ASC`;
      const responses = await Promise.all([axios.get(pageUrl)]);

      for (const res of responses) {
        if (res.status !== 200) {
          console.log(`Failed to fetch web page at ${pageUrl}`);

          return result;
        }

        const $ = cheerio.load(res.data);
        const spanTags = $('span.page-index');
        const pageIndexes = spanTags
          .map((_, element) => parseInt($(element).text()))
          .get();
        maxPageIndex = Math.max(maxPageIndex, ...pageIndexes);

        const statusRows = $('tr[data-submission-id]');

        for (let i = 0; i < statusRows.length; i++) {
          const userHandle = $(statusRows[i]).find('.rated-user').text().trim();
          if (userHandle === handle) {
            result = 'SOLVED ✅️';
            return result;
          }
        }
      }

      pageIndex++;
    }

    return result;
  } catch (error) {
    console.error('Error fetching or parsing web page:', error);
    return result;
  }
};

module.exports = { checkVerdict, getAllProblem };
