const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine','ejs');

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
  res.render("urls_index", templateVars);
})

app.get('/hello', (req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
})

//Server Listen
app.listen(PORT,() => {
  console.log(`Server is listening on ${PORT}`)
})
