const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser()) // using cookieParser middleware
function generateRandomString() {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < 6; i++) {
     result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

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
  const username = req.cookies['username'];
  const templateVars = {urls : urlDatabase, username };
  res.render('urls_index', templateVars);
});

/** 
 *  POST '/login' --> login user
 */
 app.post('/login', (req,res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
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
  const username = req.cookies['username'];
  res.render('urls_new',{username});
} )
/** 
 *  GET '/urls/:id' --> Read Show Page of particular url
 */
app.get('/urls/:shortURL', (req,res) => {
  const username = req.cookies['username'];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.render('urls_show', {shortURL, longURL,username});
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


