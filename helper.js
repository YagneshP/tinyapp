const checkUserWithEmail = function(email, db) {
  for (let user in db) {
    if (db[user]["email"] === email) {
      return db[user];
    }
  }
};

const urlsForUser = function(id, db) {
  let obj = {};
  for (let key in db) {
    if (db[key]["userID"] === id) {
      obj[key] = db[key];
    }
  }
  return obj;
};

//random string generator
const generateRandomString = function() {
  let randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
};

module.exports = { checkUserWithEmail, urlsForUser, generateRandomString };
