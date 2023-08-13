const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(() => {
  console.log('Database connection successful');
})
.catch((err) => {
  console.error('Database connection error');
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required:true
  },
  log:{
    description: String,
    duration: Number,
    date:Date
  }
})

const User = mongoose.model('User',UserSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
