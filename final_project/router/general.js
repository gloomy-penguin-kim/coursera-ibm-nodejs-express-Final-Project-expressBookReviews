const express = require('express'); 
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios') 

const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  return userswithsamename.length > 0; 
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: `User ${username} successfully registered. Now you can login`});
      } else {
          return res.status(404).json({message: `User ${username} already exists!`});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});


public_users.get("/", (req,res) => {
  axios.get('http://localhost:5000/books.json')
    .then(response => { 
        console.log(response.data)
        res.json(response.data)
    })
    .catch(err => {
        res.send(err)
    }) 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {   
  axios.get('http://localhost:5000/books.json')
    .then(response => {  
      let books = response.data[req.params.isbn]
      res.json(books)
    })
    .catch(err => {
      res.send(err)
    }) 
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) { 
  let author = req.params.author
  axios.get('http://localhost:5000/books.json')
    .then(response => {  
      let books = response.data 
      let byAuthor = []
      for (isbn in books) {
        if (books[isbn].author.toLowerCase() == author.toLowerCase()) {
          byAuthor.push(books[isbn])
        }
      }
      res.json(byAuthor)
    })
    .catch(err => {
      res.send(err)
    }) 
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) { 
  let title = req.params.title
  axios.get('http://localhost:5000/books.json')
    .then(response => {  
      let books = response.data 
      let byTitle = []
      for (isbn in books) {
        if (books[isbn].title.toLowerCase() == title.toLowerCase()) {
          byTitle.push(books[isbn])
        }
      }
      res.json(byTitle)
    })
    .catch(err => {
      res.send(err)
    }) 
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {   
  axios.get('http://localhost:5000/books.json')
    .then(response => {  
      let bookReviews = response.data[req.params.isbn].reviews
      res.json(bookReviews)
    })
    .catch(err => {
      res.send(err)
    }) 
});


module.exports.general = public_users;
