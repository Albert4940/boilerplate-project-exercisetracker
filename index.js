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
  let {data:existsUser} = await findOneByUsername(username);

  if(existsUser && existsUser!= null){
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

/*
Return an object with data field when if success 
and error field when failure
*/
const findOneByUsername = async (username) => {
  let response = '';

  try{
    response = await UserModel.findOne({ username})
    response = {data: response}
  }catch(err){
    response = {error: err};
  }
  //reverse proprietes:
  return response;
}

const findAllUsers = async () => {
  let response = '';

  try{
    response = await UserModel.find({});
    response = {data: response}
  }catch(err){
    response = {error: err}
  }
  return response;
}
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({exetended:false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//Put post and get togeter 
app.route('/api/users').get(async (req,res) => {
  let {data:response} = await findAllUsers();
  res.json(response);
})
.post(async (req, res ) => {
  const {username } = req.body;
  const response  = await createAndSaveUsername(username);
  res.json(response)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
