const express = require('express');
const router = express.Router();
const ProjectType = require('../models/ProjectType');

// GET all project types
router.get('/', async (req, res) => {
  try {
    const types = await ProjectType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new project type
router.post('/', async (req, res) => {
  const type = new ProjectType(req.body);
  try {
    const newType = await type.save();
    res.status(201).json(newType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a project type
router.delete('/:id', async (req, res) => {
  try {
    const type = await ProjectType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: 'Type not found' });
    res.json({ message: 'Type deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;