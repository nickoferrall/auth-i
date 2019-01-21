const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig');

const server = express();
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive.");
});

server.post('/api/register', (req, res) => {
  const creds = req.body;
  console.log('Creds = ', creds);
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;

  db('users')
    .insert(creds)
    .then(id => {
      res.status(201).json(ids);
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

server.listen(3300, () => console.log('Working!'));
