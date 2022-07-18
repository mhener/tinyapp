const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(expectedUserID === user, 'Error: email is not the same');
  });

  it('should return a user with valid email', function() {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = null;
    assert(expectedUserID === user, 'Error: email is not defined');

  });
});
