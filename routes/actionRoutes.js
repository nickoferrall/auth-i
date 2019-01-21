const express = require('express');
const router = express.Router();
const db = require('../database/dbConfig');
const bcrypt = require('bcryptjs');

router.post('/register', (req, res) => {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;
  db('users')
    .insert(creds)
    .then(ids => {
      const id = ids[0];
      req.session.username = user.username;
      res.status(201).json({ newUserId: id });
    })
    .catch(err => res.status(500).json(err));
});

router.get('/register', (req, res) => {
  db('users')
    .select('id', 'username', 'password')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(err));
});

router.post('/login', (req, res) => {
  const creds = req.body;
  db('users')
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        req.session.username = user.username; // on login, any info that we want stored to the session, we add to the req.session object
        res.status(200).json({ message: 'Logged in' });
      } else {
        res.status(401).json({ message: 'You shall not pass!' });
      }
    })
    .catch(err => res.status(500).json(err));
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send('You cannot leave!');
      } else {
        res.send('Goodbye!');
      }
    });
  }
});

function protected(req, res, next) {
  if (req.session && req.session.username) {
    // this checks if the user is logged in and if they has a username
    next();
  } else {
    res.status(401).json({ message: 'Not authorised.' });
  }
}

router.get('/users', protected, (req, res) => {
  if (req.session.username) {
    // do the below but as middleware
    db('users')
      .select('id', 'username', 'password')
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => res.status(500).send(err));
  } else {
    res.status(401).send('Not authorised.');
  }
});

router.get('/restricted/*', protected, (req, res) => {
  if (req.session.username) {
    // do the below but as middleware
    db('users')
      .select('id', 'username', 'password')
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => res.status(500).send(err));
  } else {
    res.status(401).send('Not authorised.');
  }
});

module.exports = router;
