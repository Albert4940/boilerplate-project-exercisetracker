const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const MONGO_URI = process.env.MONGO_URI;
require('dotenv').config()



mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Database connection successful');
})
  .catch((err) => {
    console.error('Database connection error');
  });

const ExerciceSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: Date
})

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [ExerciceSchema]
})

const UserModel = mongoose.model('User', UserSchema);

//Refactoring in order to take any field 

const createAndSaveExercice = async (_id, description,duration,date) => {
  let result = ''
  let {data:user} = await findUserById(_id);  
  date = date || Date.now()

  if(!user && user === null) {
   return {error: "User Not found!"};
  }
  
  
  user.log.push({description,duration,date});
  
  try{    
    const {log} = await user.save();    
    let lastExercice = (log[log.length - 1]) || [];
    
    const {description,duration,date} = lastExercice;
    result =  {     
      username:user.username,
      description,
      duration,
      date: new Date(date).toDateString(),
      _id
    }
    result = {data: result}
  }catch(e){
    result = {error: e};
  }
  
  return result;
}

const findUserById = async _id => {
  let response = '';
  try {
    response = await UserModel.findById({ _id })
    response = { data: response }
  } catch (err) {
    response = { error: err };
  }
  //reverse proprietes:
  return response;
}

//const f
//create exercice factory



/*
Return an object with data field when if success 
and error field when failure
*/
const findOneByUsername = async (username) => {
  let response = '';

  try {
    response = await UserModel.findOne({ username })
    response = { data: response }
  } catch (err) {
    response = { error: err };
  }
  //reverse proprietes:
  return response;
}

const findAllUsers = async () => {
  let response = '';

  try {
    response = await UserModel.find({});
    response = { data: response }
  } catch (err) {
    response = { error: err }
  }
  return response;
}
//refactoring with next
const isObjectEmpty = objectName => {
  return Object.keys(objectName).length === 0
}
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


//get full date with out time
const getFullDate = date => {
  const newDate = new Date(date)
  let fullDate = `${newDate.getUTCFullYear()}-0${newDate.getUTCMonth() +1}-${newDate.getUTCDate()}`;
  fullDate = new Date(fullDate).toUTCString()
  //convert into time in order to compare
  return new Date(fullDate).getTime();
}

const filterExercices =  (data, req) => {
  //refactoring null coall
 let {from,to,limit} = req.query;
//  const {log} = data;  
//refactoring nullcoalisiinm
  let response = data.log;
  //console.log(limit > 0)
    if(limit && limit > 0) {     
      response = response.slice(0, limit);      
    }

    if(from || to){
      from = getFullDate(from);
      
      to = getFullDate(to);
      // response = response.filter(({date}) => getFullDate(date)>= from && getFullDate(date) <= to).map(item => {
      //   item.date = new Date(date).toDateString()
      //   return item;
      // });
    }
 
  return response;
}

const findUserAndExercises = async (req) => {
  const {data:result} =  await findUserById(req.params._id);

  if(!isObjectEmpty(req.query)){
    result.log = filterExercices(result,req)
  }

  return result;
}

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ exetended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users/:_id/logs', async (req,res) => {


   let result = await findUserAndExercises(req); 
   let {username,_id,log,__v} = result;  
  log = log?.map(item => {
    const {description,duration,date} = item
     return {
      description,
      duration,
      date:new Date(date).toDateString()
     }
    }) 

  result = {
    username,
    _id,
    count:__v,
    log
  };

   res.json(result)
       
})

app.route('/api/users').get(async (req, res) => {
  let { data: response } = await findAllUsers();
  res.json(response);
})
  .post(async (req, res) => {
    const { username } = req.body;
    const response = await createAndSaveUsername(username);
    res.json(response)
  })


//refactoring result object, or remove result from route and put it an middleware function
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  let {description,duration,date} = req.body;

  let result = await createAndSaveExercice(_id,description,duration,date);
  
  result = result.data || result.error;
  res.json(result);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
