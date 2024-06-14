'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const authenticateUser = require('./utils/auth.js');
const router = express.Router();

// GET /api/users
router.get('/users', authenticateUser, async (req, res) => {
  const user = req.currentUser;
  res.status(200).json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
});

// POST /api/users
router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, emailAddress, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.create({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword
    });
    res.status(201).location('/').end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map((err) => err.message);
      res.status(400).json({ errors });
    } else {
      console.error('There was an error creating the user:', error);
      res.status(500).json({ message: 'There was an error creating the user' });
    }
  }
});
module.exports = router;
