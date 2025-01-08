const initialWorkoutData = {
  push: {
    title: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: '3x8-12' },
      { name: 'Overhead Press', sets: '3x8-12' },
      { name: 'Incline Press', sets: '3x8-12' },
      { name: 'Lateral Raises', sets: '3x12-15' },
      { name: 'Tricep Pushdown', sets: '3x12-15' },
    ],
  },
  pull: {
    title: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: '3x8-10' },
      { name: 'Pull-Ups', sets: '3x8-12' },
      { name: 'Barbell Row', sets: '3x8-12' },
      { name: 'Face Pull', sets: '3x12-15' },
      { name: 'Bicep Curl', sets: '3x12-15' },
    ],
  },
  legs: {
    title: 'Leg Day',
    exercises: [
      { name: 'Squat', sets: '3x8-12' },
      { name: 'Romanian Deadlift', sets: '3x8-12' },
      { name: 'Leg Press', sets: '3x10-12' },
      { name: 'Walking Lunge', sets: '3x8-12' },
      { name: 'Calf Raise', sets: '3x15-20' },
    ],
  },
};

module.exports = { initialWorkoutData }; 