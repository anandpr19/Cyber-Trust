require('dotenv').config();
const app = require('./app');
const {connect} = require('./db/connection')
const PORT  = process.env.PORT || 4000;  

connect().catch(err=>{
  console.error("Failed to connect",err);
})
app.listen(PORT, () => {
  console.log(`Listening on http://localhost: ${PORT}`);
});
