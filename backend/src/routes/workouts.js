const router = require('express').Router();
const Workout = require('../models/workout');

// Get all workouts
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.query.userId });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create workout
router.post('/', async (req, res) => {
  try {
    const workout = new Workout({
      ...req.body,
      date: new Date()
    });
    const newWorkout = await workout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update workout
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete workout
router.delete('/:id', async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 