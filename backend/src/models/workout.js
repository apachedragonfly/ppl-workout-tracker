const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['push', 'pull', 'legs']
  },
  exercises: [{
    name: String,
    sets: [{
      weight: Number,
      reps: Number
    }]
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema); 