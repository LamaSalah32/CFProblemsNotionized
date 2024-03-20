const { getAllProblem } = require('./fetchProblems.js');
const {
  createPage,
  deleteAllPages,
} = require('./connect with notion APIs/database.js');

exports.problem = async (
  NotionKey,
  ProblemsdDatabaseId,
  linksDatabaseId,
  BlockId
) => {
  try {
    const allProblems = await getAllProblem(
      NotionKey,
      linksDatabaseId,
      BlockId
    );
    await deleteAllPages(NotionKey, ProblemsdDatabaseId);
    const allPages = allProblems.map((page) =>
      createPage(NotionKey, page, ProblemsdDatabaseId)
    );

    await Promise.all(allPages);

    console.log('All pages created successfully');
  } catch (error) {
    console.error('Error creating page:', error);
  }
};
