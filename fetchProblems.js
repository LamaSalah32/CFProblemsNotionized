const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
const GetHandle = require('./connect with notion APIs/get-handle');

const { fetchChallengeLinks } = require('./connect with notion APIs/database');
dotenv.config({ path: '.env' });

exports.fetchProblems = async () => {
  try {
    const challenges = await fetchChallengeLinks(
      process.env.NOTION_CHALLENGES_LINKS_DATABASE_ID
    );

    const allProblems = [];

    const fetchPromises = challenges.map(async (challenge) => {
      try {
        const response = await axios.get(challenge.url);

        if (response.status === 200) {
          const html = response.data;
          const $ = cheerio.load(html);
          const optionElements = $('option');

          for (let index = 0; index < optionElements.length; index++) {
            const element = optionElements[index];
            const problemName = $(element).attr('data-problem-name'); // Changed to problemName
            const value = $(element).attr('value');
            const verdict = 'UNSOLVED';

            // const verdict = await getUser(`${challenge.url}/status/${value}`);

            if (problemName) {
              // Changed to problemName
              const link = `${challenge.url}/problem/${value}`;

              allProblems.push({
                value: value,
                Problem_name: problemName,
                University: challenge.university,
                Link: link,
                Status: verdict,
              });

              //console.log(problemName, link, challenge.name, verdict);
            }
          }
        } else {
          console.log(
            `Failed to fetch web page for ${challenge.university}. Status code: ${response.status}`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching problems for ${challenge.university}:`,
          error.message
        );
      }
    });

    await Promise.all(fetchPromises);
    // console.log(allProblems);
    return allProblems;
  } catch (error) {
    console.log('Error:', error.message);
  }
};
