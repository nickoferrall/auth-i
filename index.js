const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session); // this has to be written after session. They have to be connected. It's a contructor function which is why it's capitalised
const db = require('./database/dbConfig');

const server = express();

const sessionConfig = {
  secret: 'mySecret',
  name: 'monkey', // defaults to connect.sid - session id
  httpOnly: true, // JS can't access this
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // in production we would change this to true so it can only be accessed with https. We don't want people saving cookies to the browser on a non-secure connection
    maxAge: 1000 * 60 * 1 // milliseconds (1000 = 1 second) * 60 seconds * 1 = 1 minute. This decides when the cookies will expire
  },
  store: new KnexSessionStore({
    tablename: 'sessions',
    sidfieldname: 'sid',
    knex: db,
    createtable: true,
    clearInterval: 1000 * 60 * 60 // removes only expired sessions
  })
};
server.use(session(sessionConfig));

server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive.");
});

server.post('/api/register', (req, res) => {
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

server.get('/api/register', (req, res) => {
  db('users')
    .select('id', 'username', 'password')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(err));
});

server.post('/api/login', (req, res) => {
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

server.get('/logout', (req, res) => {
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

server.get('/api/users', protected, (req, res) => {
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

server.get('/api/restricted/*', protected, (req, res) => {
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

server.listen(3300, () => console.log('Working!'));
