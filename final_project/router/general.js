const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const bookList = await getBooks;
    res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    res.status(500).send("Error retrieving books");
  }
});


public_users.get('/isbn/:isbn', function (req, res) {
  const getBookByISBN = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => res.send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).send(err));
});


public_users.get('/author/:author', async function (req, res) {
  try {
    const getBooksByAuthor = new Promise((resolve) => {
      const author = req.params.author;
      const booksByAuthor = Object.values(books).filter(book => book.author === author);
      resolve(booksByAuthor);
    });
    const filteredBooks = await getBooksByAuthor;
    res.send(JSON.stringify(filteredBooks, null, 4));
  } catch (error) {
    res.status(500).send("Error retrieving books by author");
  }
});


public_users.get('/title/:title', function (req, res) {
  const getBooksByTitle = new Promise((resolve) => {
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    resolve(booksByTitle);
  });

  getBooksByTitle.then((filteredBooks) => {
    res.send(JSON.stringify(filteredBooks, null, 4));
  });
});


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

module.exports.general = public_users;