'use strict';

const express = require('express');
const { Course, User } = require('../models');
const authenticateUser = require('./utils/auth.js');
const router = express.Router();

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'] // exclude the createdAt, updatedAt, and password fields
        }
      ],
      attributes: [
        'id',
        'title',
        'description',
        'estimatedTime',
        'materialsNeeded'
      ] // exclude createdAt, and updatedAt fields
    });
    if (courses.length === 0) {
      return res.status(404).send({ message: 'No courses found' });
    }
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching the courses:', error);
    res.status(500).json({
      message: 'Error fetching the courses'
    });
  }
});

// GET /api/courses/:id
// We're going to return the corresponding course including the User object
router.get(`/courses/:id`, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'] // exclude the createAd, updatedAt, and password fields
        }
      ],
      attributes: [
        'id',
        'title',
        'description',
        'estimatedTime',
        'materialsNeeded'
      ] // exclude the created at and updatedAt fields
    });
    if (!course) {
      return res.status(404).json({ message: 'Course was not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('There was an error getting the course:', error);
    res.status(500).json({
      message: 'Error fetching the course',
      error
    });
  }
});

// POST /api/courses
router.post('/courses', authenticateUser, async (req, res) => {
  try {
    const course = req.body;
    course.userId = req.currentUser.id; // Associate the coures with the authenticated user
    await Course.create(course);
    res.status(201).location(`/api/courses/${course.id}`).end();
  } catch (error) {
    console.error('Error creating the course:', error);
    res
      .status(400)
      .json({ message: 'There was an error creating the course', error });
  }
});

// PUT /api/courses/:id
// We're going to update the corresponding course that matches the id parameter
router.put(`/courses/:id`, authenticateUser, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }
    if (course.userId === req.currentUser.id) {
      await course.update(req.body);
      res.status(204).end();
    } else {
      res.status(403).json({
        message: 'Access Denied. User is not owner of requested course.'
      });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.error('Error updating course', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// DELETE /api/courses/:id
// We're going to delete the coures with the matching id
router.delete(`/courses/:id`, authenticateUser, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      console.error('Error deleting the course: ', error);
      return res
        .status(404)
        .json({
          message: 'Error deleting the course. Course not found.',
          error
        });
    }
    if (course.userId === req.currentUser.id) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({
        message: 'Access denied: User is not the owner of the course.'
      });
    }
  } catch (error) {
    console.error('There was an error deleting the course', error);
    res.status(400).json({
      message: 'Error deleting the course',
      error
    });
  }
});

module.exports = router;
