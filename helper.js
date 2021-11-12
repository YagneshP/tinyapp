function checkUserWithEmail(email, db) {
  for(let user in db) {
    if(db[user]['email'] === email) {
      return db[user];
    }
  }
}

function urlsForUser(id, db) {
  let obj = {};
  for (let key in db) {
    if (db[key]['userID'] === id) {
      obj[key] = db[key];
    }
  }
  return obj;
}

module.exports = {checkUserWithEmail,urlsForUser};
