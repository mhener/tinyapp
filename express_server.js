/// SERVER SETUP:

const express = require('express');
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');


/// Setting ejs as the view engine:

app.set('view engine', 'ejs');

/// MIDDLEWARE SETUP:

app.use(express.urlencoded({ extended: true }));
app.use(morgan());
app.use(cookieSession({
  name: 'session',
  keys: [["$oksq/!134k,M", "Pequeno pollo de la pampa"]],
}));

// DATABASES:

const {urlDatabase, users} = require('./databases');

// FUNCTIONS:

const { generateRandomString, getUserByEmail, getUserByID, urlsForUser } = require('./helpers');

/// ROUTE SETUP:

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/// REGISTER:

/// Render the register page:
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  } else {
    const user = users[req.session.user_id];
    const templateVars = {user};
    res.render('urls_register', templateVars);
  }
});

/// Submit a registeration form:
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString(6);
  const user = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('Error 404: Your email or password is invalid.');
  }
  if (user) {
    return res.status(400).send('Error 404: Your email is already registered to an existing account.');
  } else {
    users[userID] = {id: userID, email, password: hashedPassword};
    req.session.user_id = userID.id;
    return res.redirect('/urls');
  }
});

/// LOGIN PAGE:

/// Render Login page:
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  } else {
    const userID = req.session.user_id;
    const user = getUserByID(userID, users);
    const templateVars = {user};
    res.render('urls_login', templateVars);
  }
});

/// POST TO LOG IN:
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);
  const user = getUserByID(userID, users);
  
  if (!password || ! email) {
    return res.status(403).send('Error 403: Please fill in the email and/or password sections provided.');
  } else if (!userID) {
    return res.status(403).send('Error 403: No account found with the provided email address.');
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Error 403: Incorrect password. Please try again.');
  } else {
    req.session.user_id = userID.id;
    return res.redirect('/urls');
  }
});

/// POST TO LOG OUT:
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

/// URL PAGES:

/// Renders the urls_index page:
app.get('/urls', (req,res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);
  
  if (!req.session.user_id) {
    return res.redirect('/login');
  } else {
    const templateVars = {urls: userURLs, user: users[userID]};
    res.render('urls_index', templateVars);
  }
});

/// Creates a new submission
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  const user = getUserByID(userID, users);
  if (user) {
    urlDatabase[shortURL] = {longURL, userID};
    return res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(403).send('Error 403: Please login or register for an account to create a new short URL.');
  }
});

/// Renders the urls_new page:
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const urls = urlDatabase;
  if (!userID) {
    return res.redirect('/login');
  } else {
    const templateVars = {user: users[userID], urls};
    res.render("urls_new", templateVars);
  }
});

/// Renders the urls_show page:
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {};
  const userURLs = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  if (!userID) {
    templateVars.user = null;
  } else {
    if (userURLs[shortURL]) {
      templateVars.user = users[userID];
      templateVars.longURL = longURL;
      templateVars.shortURL = shortURL;
    } else {
      templateVars.user = users[userID];
      templateVars.shortURL = null;
    }
  }
  res.render("urls_show", templateVars);
});

/// Edit a submission:
app.post("/urls/:shortURL/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("Error 403: You do not have access to this page.");
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    if (userURLs[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect("/urls");
    } else {
      return res.status(403).send("Error 403: You do not have access to this page");
    }
  }
});

/// Delete a submission
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send('Error 403: You do not have acccess to this page.');
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    const urlToDelete = req.params.shortURL;
    if (userURLs[urlToDelete]) {
      delete urlDatabase[urlToDelete];
      return res.redirect('/urls');
    } else {
      return res.status(403).send('Error 403: You do not have access to this page.');
    }
  }
});
    
/// Redirect to the actual long URL:
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    return res.redirect(urlDatabase[shortURL].longURL);
  } else {
    return res.status(403).send('The link does not exist.');
  }
});

/// Server listening to PORT:
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});