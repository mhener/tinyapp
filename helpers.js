/// FUNCTIONS:

// Function that generates the random string for the short URL
const generateRandomString = function(idlength) {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYSabcdefghijklmnopqrstuvwxyz123456789';
  let length = char.length;
  for (let i = 0; i < idlength; i++) {
    result += char.charAt(Math.floor(Math.random() * length));
  }
  return result;
};

// User email lookup function:
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return null;
};

// User ID lookup function:
const getUserByID = function(userID, users) {
  const user = users[userID];
  if (user) {
    return user;
  }
  return null;
};

// URL for user function:
const urlsForUser = (id, urlDatabase) => {
  let userURLdata = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLdata[url] = urlDatabase[url];
    }
  }
  return userURLdata;
};

module.exports = {generateRandomString, getUserByEmail, getUserByID, urlsForUser}