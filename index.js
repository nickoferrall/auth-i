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

const routes = require('./routes/actionRoutes');
server.use('/api', routes);

server.listen(3300, () => console.log('Working!'));

module.exports = server;
