require('dotenv').config();
const app = require('./app');
const {connect} = require('./db/connection')
const { PORT } = require('./config');

connect().catch(err=>{
  console.error("Failed to connect",err);
})
app.listen(PORT, () => {
  console.log(`Cyber-Trust Backend listening on http://localhost:${PORT}`);
});
