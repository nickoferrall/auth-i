const express = require('express');
const router = express.Router();
const db = require('../database/dbConfig');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  try {
    const creds = req.body;
    const hash = bcrypt.hashSync(creds.password, 14);
    creds.password = hash;
    const ids = await db('users').insert(creds);
    const id = ids[0];
    req.session.username = user.username;
    res.status(201).json({ newUserId: id });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const creds = req.body;
    const user = await db('users')
      .where({ username: creds.username })
      .first();
    if (user && bcrypt.compareSync(creds.password, user.password)) {
      req.session.username = user.username; // on login, any info that we want stored to the session, we add to the req.session object
      res.status(200).json({ message: 'Logged in' });
    } else {
      res.status(401).json({ message: 'You shall not pass!' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
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

router.get('/users', protected, async (req, res) => {
  try {
    const users = await db('users').select('id', 'username', 'password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(users);
  }
});

router.get('/restricted/*', protected, async (req, res) => {
  try {
    const users = await db('users').select('id', 'username', 'password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(err);
  }
});

module.exports = router;
