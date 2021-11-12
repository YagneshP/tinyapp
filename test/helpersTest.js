const { assert } = require("chai");

const { checkUserWithEmail } = require("../helper.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = checkUserWithEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user["id"], expectedUserID);
  });
  it("should return undefined with invalid email", function() {
    const user = checkUserWithEmail("test@test.com", testUsers);
    assert.isUndefined(user, "user should be undefined with invalid email");
  });
});
