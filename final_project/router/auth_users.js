const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  if (!username) return;
  let userWithUserName = users.filter(user => users.username === username);
  return userWithUserName.length === 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username , password } = req.body;
  if(!username || !password){
    return res.status(400).json({ message: "Username and password are required" });
  }
  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({data:username},"access",{ expiresIn : 60*60})
    req.session.authorization = {accessToken,username}
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review; // Review passed as a query string
  
  // Retrieve username from session (populated via your authentication middleware)
  const username = req.session.authorization ? req.session.authorization.username : null;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content cannot be empty" });
  }

  // Check if book exists
  if (books[isbn]) {
    let book = books[isbn];
    
    // Add or update the review for this specific user
    book.reviews[username] = review;
    
    return res.status(200).json({ 
      message: `The review for the book with ISBN ${isbn} has been added/updated.` 
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization.username : null;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (books[isbn]) {
    let book = books[isbn];
    
    // Check if this user has a review to delete
    if (book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ 
        message: `Reviews for the ISBN ${isbn} posted by the user ${username} have been deleted.` 
      });
    } else {
      return res.status(404).json({ message: "No review found for this user to delete" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
