const express = require('express');
const jwt = require('jsonwebtoken'); 
const regd_users = express.Router();

const fs = require('fs');
const path = require('path');

const axios = require('axios') 

let users = [ {username: "kim", password: "123"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let userswithsamename = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return userswithsamename.length > 0; 
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});


// I had absolutely no idea how to do this with a static resource.  I thought about adding
// mongoose and just doing it with a database or something.  This is not possible with nodemon
// because it restarts each time the file is updated.  I am just using a json file as my 
// database basically and the update/delete both modify that file

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => { 
  let isbn = req.params.isbn;
  let username = req.session.authorization.username 
  let review = req.body.review 

  axios.get('http://localhost:5000/books.json')
    .then(response => {
      console.log(response.data)
      books = response.data 
      books[isbn].reviews[username] = review 

      const appDir = path.dirname(require.main.filename);
      const filePath = path.join(appDir, 'public', 'books.json')

      // this is safe for async actions (ie, if the file is being read at the "same" time)
      fs.writeFile(filePath, JSON.stringify(books, null, 4), (err) => {
          if (err) {
            console.error(err);
            return;
          } 
          return res.status(200).json({message: "Review Updated for " + 
            books[isbn].title + " by user " + username });
        });
    })
    .catch(error => {
      res.status(500).json({message: error})
    })
});


regd_users.delete("/auth/review/:isbn", (req, res) => { 
  let isbn = req.params.isbn;
  let username = req.session.authorization.username  

  axios.get('http://localhost:5000/books.json')
    .then(response => {
      console.log(response.data)
      books = response.data  
      delete books[isbn].reviews[username]  

      const appDir = path.dirname(require.main.filename);
      const filePath = path.join(appDir, 'public', 'books.json')

      // this is safe for async actions (ie, if the file is being read at the "same" time)
      fs.writeFile(filePath, JSON.stringify(books, null, 4), (err) => {
          if (err) {
            console.error(err);
            return;
          } 
          return res.status(200).json({message: "Review deleted for " + 
            books[isbn].title + " by user " + username });
        });
    })
    .catch(error => {
      res.status(500).json({message: error})
    })
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


 