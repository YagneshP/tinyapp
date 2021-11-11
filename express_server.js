const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const checkUserWithEmail = require('./helper');
const PORT = 8080;

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2']
}))

//random string generator
function generateRandomString() {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < 6; i++) {
     result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

function urlsForUser(id) {
  let obj = {};
  for(key in urlDatabase){
    if(urlDatabase[key]['userID'] === id){
      obj[key] = urlDatabase[key]
    }
  }
  return obj;
}
//userDatabase
const users = { 
  "JqeVGE": {
    id: 'JqeVGE',
    email: 'test@test.com',
    password: '$2a$10$0NRCRUOpGjbBnpgjQPQdc.wkunDCEEMvBJihg4trciirAOLs8VYMe'
  }
}
//urlDataBase
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

/**
 * Routes
 */


/** 
 *  GET '/' --> Home
 */
app.get('/', (req,res) => {
  res.send('Hello World');
});
/** 
 *  GET '/urls.json' --> json urlDatabase
 */
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
/** 
 *  GET '/urls' --> index page of URLs
 */
app.get('/urls', (req,res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if(user){
    const templateVars = {urls : urlsForUser(user['id']), user};
    return res.render('urls_index', templateVars);
  }
  return res.redirect('/login');
});

/** 
 *  POST '/login' --> login user by setting cookie
 */
 app.post('/login', (req,res) => {
  const {email,password} = req.body;
  if(email && password){
    const user  = checkUserWithEmail(email,users);
    if (user) {
      const isCorrectPassword = bcrypt.compareSync(password, user['password']);
      if (isCorrectPassword) {
        req.session.user_id = user['id'];
        return res.redirect('/urls');
      }
      return res.status(403).send(`Password doesn't match`);
    }
    return res.status(403).send('Email not found');
  }
  return res.status(400).send('email and password can not be empty');
});

/** 
 *  POST '/logout' --> logout user by clear cookie
 */
 app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

/** 
 *  GET '/register' --> render Registration form
 */
 app.get('/register', (req,res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  //if loggedIn dont show register page ??
  res.render('registrationForm',{user});
});

/** 
 *  GET '/login' --> render login form
 */
 app.get('/login', (req,res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  //if loggedIn dont show login page ??
  res.render('logInform',{user});
});

/** 
 *  POST '/register' --> render Registration form
 */
 app.post('/register', (req,res) => {
  //create user object
  const {email, password} = req.body;
  if(email && password) {
    if (!checkUserWithEmail(email,users)) {
      const id = generateRandomString();
      //hashing password
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = {id, email, password:hashedPassword};
      users[id] = user;
      req.session.user_id = id
      return res.redirect('/urls');
    };
    return res.status(400).send('Email already exists');
  }
  return res.status(400).send('email and password can not be empty');
});


/** 
 *  POST '/urls' --> Create new url
 */
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if(user){
    const newShortUrl = generateRandomString();
    const longURL = req.body.longURL;
    const userID = user['id'];
    urlDatabase[newShortUrl] = {longURL,userID};
    console.log('After creating new url urlDatabase:', urlDatabase);
    return res.redirect(`/urls/${newShortUrl}`); 
  }
  return res.status(401).send('Unathorized client').redirect("/login");
});
/** 
 *  GET '/urls/new' --> Read New URLForm
 */
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if(user){
    return res.render('urls_new',{user});
  }
  return res.status(401).send('Unathorized client');
});
/** 
 *  GET '/urls/:id' --> Read Show Page of particular url
 */
app.get('/urls/:shortURL', (req,res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  //check if user loggedIn
  if(user){
    //check if shortURL in the urlDB
    if(urlDatabase.hasOwnProperty(shortURL)){
      const {longURL,userID}= urlDatabase[shortURL];
      // check if shortURL owns by loggedIn user
      if(userID === user.id){
        return res.render('urls_show', {shortURL, longURL,user});
      }
      return res.status(401).send('Unathorized client').redirect("/login");
    }
    return res.send('shortURL not found');
  }
  return res.send('User not logged in');
});
/** 
 *  POST '/urls/:shortURL' --> Update Url
 */
app.post('/urls/:shortURL', (req,res) => {
  // const userID = req.cookies['user_id'];
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const user = users[userID];
  if(user){
    if(shortURL && urlDatabase.hasOwnProperty(shortURL)){
      if(urlDatabase[shortURL]['userID'] === userID) {
        urlDatabase[shortURL] = {longURL,userID};
        return res.redirect("/urls");
      }
    }
    return res.send('shortUrl not found!');
  }
  return res.send('Unauthorized user');
})
/** 
 *  GET '/u/:shortURL' --> Redirect to longURL
 */
app.get('/u/:shortURL', (req,res) => {
  if(urlDatabase.hasOwnProperty(req.params.shortURL)){
    const {longURL} = urlDatabase[req.params.shortURL];
    return res.redirect(longURL);
  }
  return res.send('shortURL doesnt exist');
});
/** 
 *  POST '/urls/:shortURL' --> Delete URL
 */
app.post('/urls/:shortURL/delete', (req, res) => {
  //check if user there
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    const shortURL = req.params.shortURL;
    // if user authorized to delete
    if(urlDatabase[shortURL]['userID'] === userID) {
      delete urlDatabase[shortURL];
      return res.redirect('/urls');
    }
    return res.send('Unauthorized user');
  }
  return res.redirect("/login");
});
/** 
 *  GET '/hello' --> sending HTML data
 */
app.get('/hello', (req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

//Server Listen
app.listen(PORT,() => {
  console.log(`Server is listening on ${PORT}`)
});


