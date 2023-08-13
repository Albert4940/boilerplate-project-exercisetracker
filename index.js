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

const UserModel = mongoose.model('User',UserSchema);

//Refactoring in order to take any field 
const createAndSaveUsername = async (username) => {
  let response = '';
  //handle error
  let existsUser = await findOneByUsername(username);

  if(existsUser != null){
    return existsUser;
  }
  const User = new UserModel({
    username: username,
  })

  try{
    response = await User.save();
  }catch(err){
    response = err;
  }

    
  return response;
}

//return string for error and object for success
const findOneByUsername = async (username) => {
  let response = '';

  try{
    response = await UserModel.findOne({ username})
  }catch(err){
    response = err;
  }
  //handle error and reverse proprietes:
  return response;
}

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({exetended:false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res ) => {
  const {username } = req.body;
  const response  = await createAndSaveUsername(username);
  res.json(response)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
