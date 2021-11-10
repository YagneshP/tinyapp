const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser()) // using cookieParser middleware

//random string generator
function generateRandomString() {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < 6; i++) {
     result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

function checkEmail(email) {
  for(let user in users) {
    if(users[user]['email'] === email) {
      return true;
    }
  }
  return false;
}
//userDatabase
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//urlDataBase
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = {urls : urlDatabase, user};
  res.render('urls_index', templateVars);
});

/** 
 *  POST '/login' --> login user by setting cookie
 */
 app.post('/login', (req,res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

/** 
 *  POST '/logout' --> logout user by clear cookie
 */
 app.post('/logout', (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

/** 
 *  GET '/register' --> render Registration form
 */
 app.get('/register', (req,res) => {
  res.render('registrationForm');
});

/** 
 *  POST '/register' --> render Registration form
 */
 app.post('/register', (req,res) => {
  //create user object
  const {email, password} = req.body;
  if(email && password) {
    if (!checkEmail(email)) {
      const id = generateRandomString();
      const user = {id, email, password};
      users[id] = user;
      res.cookie('user_id', id);
      console.log("Users after creatin user", users)
      return res.redirect('/urls');
    };
    console.log("if email exist Users :", users)
    return res.status(400).send('Email already exists');
  }
  return res.status(400).send('email and password can not be empty');
});


/** 
 *  POST '/urls' --> Create new url
 */
app.post('/urls', (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`)
});
/** 
 *  GET '/urls/new' --> Read New URLForm
 */
app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  res.render('urls_new',{user});
} )
/** 
 *  GET '/urls/:id' --> Read Show Page of particular url
 */
app.get('/urls/:shortURL', (req,res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.render('urls_show', {shortURL, longURL,user});
});
/** 
 *  POST '/urls/:shortURL' --> Update Url
 */
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
})
/** 
 *  GET '/u/:shortURL' --> Redirect to longURL
 */
app.get('/u/:shortURL', (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
/** 
 *  POST '/urls/:shortURL' --> Delete URL
 */
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
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


