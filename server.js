const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const App = require('./index');

// Set the port
const port = 4000 || process.env.PORT;

// Start the Express server
App.listen(port, () => {
  console.log(`app running on port: ${port}..`);
});
