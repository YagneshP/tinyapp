const express = require("express");
const app = express();
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { checkUserWithEmail, urlsForUser, generateRandomString } = require("./helper");
const { users, urlDatabase } = require("./db");
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

/***** Routes *****/

/**
 *  GET '/' --> Home
 */

app.get("/", (req, res) => {
  res.redirect("/urls");
});

/**
 *  GET '/urls' --> index page of URLs
 */

app.get("/urls", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (!user) {
    return res.status(401).send('<h4>Unauthorized client</h4><p>Please <a href="/login">login</a> </p>');
  }
  const templateVars = { urls: urlsForUser(user["id"], urlDatabase), user };
  return res.render("urls_index", templateVars);
});

/**
 *  POST '/login' --> login user by setting cookie
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = checkUserWithEmail(email, users);
    if (user) {
      const isCorrectPassword = bcrypt.compareSync(password, user["password"]);
      if (isCorrectPassword) {
        req.session.userID = user["id"];
        return res.redirect("/urls");
      }
      return res.status(403).send("<h4>Password doesn't match</h4>");
    }
    return res.status(403).send("<h4>Email not found</h4>");
  }
  return res.status(400).send("<h4>Email and Password can not be empty</h4>");
});

/**
 *  POST '/logout' --> logout user by clear cookie
 */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/**
 *  GET '/register' --> render Registration form
 */
app.get("/register", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  //if loggedIn dont show register page ??
  res.render("registrationForm", { user });
});

/**
 *  GET '/login' --> render login form
 */
app.get("/login", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  //if loggedIn dont show login page ??
  res.render("logInform", { user });
});

/**
 *  POST '/register' --> render Registration form
 */
app.post("/register", (req, res) => {
  //create user object
  const { email, password } = req.body;
  if (email && password) {
    if (!checkUserWithEmail(email, users)) {
      const id = generateRandomString();
      //hashing password
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = { id, email, password: hashedPassword };
      users[id] = user;
      req.session.userID = id;
      return res.redirect("/urls");
    }
    return res.status(400).send("<h4>Email already exists</h4>");
  }
  return res.status(400).send("<h4>Email and Password can not be empty</h4>");
});

/**
 *  POST '/urls' --> Create new url
 */
app.post("/urls", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    const newShortUrl = generateRandomString();
    const longURL = req.body.longURL;
    const userID = user["id"];
    urlDatabase[newShortUrl] = { longURL, userID };
    return res.redirect(`/urls/${newShortUrl}`);
  }
  return res.status(401).send("<h4>Unathorized client</h4>");
});
/**
 *  GET '/urls/new' --> Read New URLForm
 */
app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    return res.render("urls_new", { user });
  }
  return res.redirect("/login");
});
/**
 *  GET '/urls/:id' --> Read Show Page of particular url
 */
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  const shortURL = req.params.shortURL;
  //check if shortURL in the urlDB
  if (urlDatabase[shortURL]) {
    //check if user loggedIn
    if (user) {
      const { longURL, userID } = urlDatabase[shortURL];
      // check if shortURL owns by loggedIn user
      if (userID === user.id) {
        return res.render("urls_show", { shortURL, longURL, user });
      }
      return res.status(401).send("<h4>Unathorized client</h4>");
    }
    return res.send("<h4>User not logged in</h4> <p><a href='/login'>Please LogIn</a></p>");
  }
  return res.send("<h4>URL not found</h4> <p><a href='/urls'>Go to Home</a></p>");
});
/**
 *  POST '/urls/:shortURL' --> Update Url
 */
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const user = users[userID];
  if (user) {
    if (shortURL && urlDatabase[shortURL]) {
      if (urlDatabase[shortURL]["userID"] === userID) {
        urlDatabase[shortURL] = { longURL, userID };
        return res.redirect("/urls");
      }
      return res.send("<h4>Unauthorized User</h4>");
    }
    return res.send("<h4>Url not found!</h4>");
  }
  return res.send("<h4>User not logged in</h4> <p><a href='/login'>Please LogIn</a></p>");
});

/**
 *  GET '/u/:shortURL' --> Redirect to longURL
 */
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const { longURL } = urlDatabase[req.params.shortURL];
    return res.redirect(longURL);
  }
  return res.send("<h4>URL doesn't exist</h4>");
});

/**
 *  POST '/urls/:shortURL' --> Delete URL
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  //check if user there
  const userID = req.session.userID;
  const user = users[userID];
  if (user) {
    const shortURL = req.params.shortURL;
    // if user authorized to delete
    if (urlDatabase[shortURL]["userID"] === userID) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    }
    return res.send("<h4>Unauthorized user</h4>");
  }
  return res.send("<h4>User not logged in</h4> <p><a href='/login'>Please LogIn</a></p>");
});

//Server Listen
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
