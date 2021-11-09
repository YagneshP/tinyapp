const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
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

app.get('/', (req,res) => {
  res.send('Hello World');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => {
  const templateVars = {urls : urlDatabase};
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`)
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
} )

app.get('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.render('urls_show', {shortURL, longURL});
});

app.get('/u/:shortURL', (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/hello', (req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

//Server Listen
app.listen(PORT,() => {
  console.log(`Server is listening on ${PORT}`)
})
