const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  workoutLogs: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  customWorkouts: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  hiddenExercises: [String],
  personalStats: {
    bodyWeight: String,
    height: String,
    age: String,
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: false // Allow flexible schema
});

module.exports = mongoose.model('User', userSchema); 