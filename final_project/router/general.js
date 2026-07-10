const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper functions wrapping your local database operations in Promises
const getAllBooks = () => {
    return new Promise((resolve) => {
        resolve(books);
    });
};

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });
};

const getBooksByAuthor = (author) => {
    return new Promise((resolve) => {
        const bookKeys = Object.keys(books);
        const matchedBooks = [];
        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchedBooks.push({ isbn: key, ...books[key] });
            }
        });
        resolve(matchedBooks);
    });
};

const getBooksByTitle = (title) => {
    return new Promise((resolve) => {
        const bookKeys = Object.keys(books);
        const matchedBooks = [];
        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchedBooks.push({ isbn: key, ...books[key] });
            }
        });
        resolve(matchedBooks);
    });
};


// Task 6: Register User
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const doesExist = users.some(user => user.username === username);
  if (doesExist) {
    return res.status(400).json({ message: "Username already exists!" });
  }
  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getAllBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks (.then)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then((book) => {
        return res.status(200).json(book);
    })
    .catch((err) => {
        return res.status(err.status || 500).json({ message: err.message });
    });
});
  
// Task 12: Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const matchedBooks = await getBooksByAuthor(author);

    if (matchedBooks.length > 0) {
      return res.status(200).json(matchedBooks);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Task 13: Get all books based on title using Promise callbacks (.then)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  getBooksByTitle(title)
    .then((matchedBooks) => {
        if (matchedBooks.length > 0) {
            return res.status(200).json(matchedBooks);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    })
    .catch(() => {
        return res.status(500).json({ message: "Internal server error" });
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;