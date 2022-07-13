// SERVER SETUP:

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const morgan = require("morgan");

// URL Database const {}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Function that generates the random string for the short URL

function generateRandomString(idlength) {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYSabcdefghijklmnopqrstuvwxyz123456789';
  let length = char.length;
  for (let i = 0; i < idlength; i++) {
    result += char.charAt(Math.floor(Math.random() * length));
  }
  return result;
}

// Setting ejs as the view engine:

app.set('view engine', 'ejs');

// MIDDLEWARE SETUP:

app.use(express.urlencoded({ extended: true })); 

app.use(cookieParser());

app.use(morgan());

// ROUTE SETUP:

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/// Renders the urls_index page:
app.get('/urls', (req,res) => {
  const templateVars = 
  {urls: urlDatabase,
  username: req.cookies["username"]};
  res.render('urls_index', templateVars);
});


/// Renders the urls_new page:
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

/// Renders the urls_show page:
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  console.log(longURL);
  const templateVars = { 
    id, 
    longURL,
    username: req.cookies['username']
   };
  res.render("urls_show", templateVars);
});

/// Creates a new submission 
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

/// Edit a submission:
app.post("/urls/:id/", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/');
});

/// Redirect to the actual long URL:
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

/// Delete a submission
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/// POST TO LOG IN:
app.post("/login", (req, res) => {
  const userLoginName = req.body.username;
  res.cookie('username', userLoginName);
  res.redirect("/urls");
});

/// POST TO LOG OUT:
 app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('urls');
 })

app.get('/register'), (req, res) => {
  res.render('/register');
}

// Server listening to PORT:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});