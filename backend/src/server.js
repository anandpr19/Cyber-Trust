require('dotenv').config();
const app = require('./app');
const { PORT } = require('./config');

app.listen(PORT, () => {
  console.log(`Cyber-Trust Backend listening on http://localhost:${PORT}`);
});
