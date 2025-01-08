const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { initialWorkoutData } = require('../constants/workoutData');

// Add content-type header to all responses
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Unified login/register endpoint
router.post('/auth', async (req, res) => {
  try {
    console.log('Auth request received:', req.body);
    const { username, password } = req.body;
    
    let user = await User.findOne({ username });
    
    if (!user) {
      // New user - register
      console.log('Creating new user:', username);
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        username,
        password: hashedPassword,
        workoutLogs: {},
        customWorkouts: initialWorkoutData,
        hiddenExercises: [],
        createdAt: new Date()
      });
      await user.save();
      console.log('New user created:', username);
    } else {
      // Existing user - verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }
      console.log('User logged in:', username);
    }

    // Return user data
    res.json({
      username: user.username,
      workoutLogs: user.workoutLogs || {},
      customWorkouts: user.customWorkouts || initialWorkoutData,
      hiddenExercises: user.hiddenExercises || [],
      personalStats: user.personalStats || {},
      goals: user.goals || {},
      profileImage: user.profileImage,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user data
router.put('/:username/data', async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body;
    
    // Find the user first
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Merge the data instead of overwriting
    const mergedWorkoutLogs = {
      ...user.workoutLogs,
      ...updateData.workoutLogs
    };

    // Update with merged data
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { 
        $set: {
          ...updateData,
          workoutLogs: mergedWorkoutLogs
        }
      },
      { new: true }
    );
    
    console.log('Updated data for user:', username);
    
    res.json({
      username: updatedUser.username,
      workoutLogs: updatedUser.workoutLogs,
      customWorkouts: updatedUser.customWorkouts,
      hiddenExercises: updatedUser.hiddenExercises,
      personalStats: updatedUser.personalStats,
      goals: updatedUser.goals,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add password change endpoint
router.put('/:username/password', async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user data
router.get('/:username/data', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('GET /users/data request:', {
      username,
      headers: req.headers,
      url: req.url,
      method: req.method
    });
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(404).json({ 
        message: 'User not found',
        requestedUsername: username 
      });
    }
    
    const userData = {
      username: user.username,
      workoutLogs: user.workoutLogs || {},
      customWorkouts: user.customWorkouts || initialWorkoutData,
      hiddenExercises: user.hiddenExercises || [],
      personalStats: user.personalStats || {},
      goals: user.goals || {},
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      lastSync: new Date().toISOString()
    };
    
    console.log('Sending response:', {
      username,
      dataKeys: Object.keys(userData),
      contentLength: JSON.stringify(userData).length
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error in GET /users/data:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 