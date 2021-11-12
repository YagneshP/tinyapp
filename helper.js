function checkUserWithEmail(email, db) {
  for(let user in db) {
    if(db[user]['email'] === email) {
      return db[user];
    }
  }
}

module.exports = {checkUserWithEmail};
