const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const RegisterUser = require('./models/registerUser');

const app = express();

const corsOptions = {
  // origin : 'http://127.0.0.1:5500'
  origin: "*",
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));

const mongoURI = "mongodb+srv://nodejsera:test321@urlshortener.6jhak.mongodb.net/nodejsera?retryWrites=true&w=majority";

const connectToMongoDb = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(6200);
    console.log(`Back end server running on 6200`);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

connectToMongoDb();

app.get('/', (req, res) => {
  res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/index.html');
});

app.post('/sign_up', async (req, res) => {

  const username = req.body.username;
  const fullName = req.body.fullName;
  const password = req.body.password;

  if(username === undefined || username === '' || password === undefined || password === '' || fullName === undefined || fullName === ''){
    return res.status(400).json({message: "Enter valid credentials"});
  } else {
    console.log(username, fullName, password);

    const user = await RegisterUser.findOne({username:req.body.username});

    if(user){
      return res.status(409).json({message: "Username already exists"});
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      const registerUser = new RegisterUser({
        username: req.body.username,
        password: hash,
        fullName: req.body.fullName
      });
      
      const result = await registerUser.save();
      console.log('result --------- ',result);
      return res.status(200).json(req.body.username);
    }
  }
});

app.get('/signin', async (req, res) => {
  return res.redirect('/public/signin.html');
});

app.post('/sign_in', async (req, res) => {
  console.log('signin post');
  const username = req.body.username;
  const password = req.body.password;
  if(username === undefined || username === '' || password === undefined || password === ''){
    return res.status(400).json({message: "Enter valid credentials"});
  } else {
    const user = await RegisterUser.findOne({username: req.body.username});
    if(user){
      const checkPassword = await bcrypt.compare(req.body.password, user.password);
      if(checkPassword){
        return res.status(200).json({username: user.username, fullName: user.fullName});
      } else {
          return res.status(404).json({message: "Enter valid credentials"});
      }
    } else {
      return res.send(404).json({message: "Enter valid credentials"});
    }
  }
});