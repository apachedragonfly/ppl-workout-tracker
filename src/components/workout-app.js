"use client"

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dumbbell,
  Calendar,
  TrendingUp,
  LogIn,
  LogOut,
  User,
  Check,
  Plus,
  Minus,
  Edit,
  Save,
  X,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useRouter } from 'next/navigation'
import { API_URL, logApiCall } from '@/config'

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
}

const TimeRange = {
  MONTH: 'month',
  YEAR: 'year',
}

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      // Check if user exists
      const existingUser = localStorage.getItem(`user_${username}`)
      let userData = {
        username,
        password,
        workoutLogs: {},
        customWorkouts: initialWorkoutData,
        hiddenExercises: []
      }

      if (existingUser) {
        // Verify password for existing user
        const parsed = JSON.parse(existingUser)
        if (parsed.password !== password) {
          setError('Invalid password')
          return
        }
        userData = parsed
      }

      // Store/update user data
      localStorage.setItem(`user_${username}`, JSON.stringify(userData))
      localStorage.setItem('currentUser', JSON.stringify(userData))
      onLogin(userData)
      setError('')
    } catch (error) {
      console.error('Auth error:', error)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Dumbbell className="h-8 w-8" />
          <h1 className="text-3xl font-bold">PPL Workout Tracker</h1>
        </div>
        <p className="text-gray-500">Track your Push, Pull, Legs progress</p>
      </div>
      
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login / Register</CardTitle>
          <CardDescription>
            Enter your details to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm" htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export const HeatmapChart = ({
  logs,
  timeRange,
  selectedMonth = new Date(),
  onDayClick,
}) => {
  const getDateRange = () => {
    const currentYear = new Date().getFullYear()
    if (timeRange === TimeRange.YEAR) {
      return {
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 11, 31),
      }
    } else {
      const date = new Date(selectedMonth)
      return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      }
    }
  }

  const { start, end } = getDateRange()

  const getIntensityLevel = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayLog = logs[dateStr]

    if (!dayLog) return 0
    const completedCount = Object.values(dayLog).filter(
      (log) => log.completed
    ).length
    if (completedCount === 0) return 0
    if (completedCount <= 2) return 1
    if (completedCount <= 4) return 2
    return completedCount <= 6 ? 3 : 4
  }

  const days = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d),
      intensity: getIntensityLevel(d),
    })
  }

  const getColor = (intensity) => {
    const colors = [
      'bg-gray-100',
      'bg-green-200',
      'bg-green-300',
      'bg-green-400',
      'bg-green-500',
    ]
    return colors[intensity]
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day, index) => (
        <button
          key={index}
          onClick={() => onDayClick(day.date)}
          className={`w-3 h-3 rounded-sm ${getColor(day.intensity)} hover:ring-2 hover:ring-blue-400 transition-all`}
          title={`${day.date.toLocaleDateString()}`}
        />
      ))}
    </div>
  )
}

const ProgressChart = ({ logs, exerciseName }) => {
  const metrics = useMemo(() => {
    const data = []
    let personalBest = 0
    let totalVolume = 0
    let sessionsCount = 0
    
    Object.entries(logs)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .forEach(([date, exercises]) => {
        if (exercises[exerciseName]) {
          const weights = exercises[exerciseName].weights.map(w => parseFloat(w) || 0)
          const maxWeight = Math.max(...weights)
          const dayVolume = weights.reduce((sum, weight) => sum + weight, 0) * 8 // Assuming 8 reps per set
          
          if (maxWeight > 0) {
            personalBest = Math.max(personalBest, maxWeight)
            totalVolume += dayVolume
            sessionsCount++
            
            data.push({
              date: new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }),
              weight: maxWeight,
              volume: dayVolume
            })
          }
        }
      })

    return {
      data,
      personalBest,
      averageVolume: sessionsCount ? Math.round(totalVolume / sessionsCount) : 0,
      lastWeight: data.length ? data[data.length - 1].weight : 0,
      progress: data.length >= 2 ? 
        Math.round(((data[data.length - 1].weight - data[0].weight) / data[0].weight) * 100) : 0
    }
  }, [logs, exerciseName])

  if (metrics.data.length < 2) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        Add more workout data to see progress
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Personal Best</div>
          <div className="font-medium">{metrics.personalBest} lbs</div>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Current Weight</div>
          <div className="font-medium">{metrics.lastWeight} lbs</div>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Avg. Volume/Session</div>
          <div className="font-medium">{metrics.averageVolume} lbs</div>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Overall Progress</div>
          <div className={`font-medium ${metrics.progress >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.progress > 0 ? '+' : ''}{metrics.progress}%
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics.data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              label={{ 
                value: 'Weight (lbs)', 
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              labelStyle={{ fontSize: 12 }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const ExerciseStats = ({ exercise, logs }) => {
  const stats = useMemo(() => {
    const data = Object.entries(logs)
      .filter(([_, exercises]) => exercises[exercise.name])
      .map(([date, exercises]) => ({
        date: new Date(date),
        weights: exercises[exercise.name].weights.map(w => parseFloat(w) || 0)
      }))
      .sort((a, b) => b.date - a.date) // Sort by date descending

    if (data.length === 0) return null

    const lastWorkout = data[0]
    const maxWeight = Math.max(...lastWorkout.weights)
    const volume = lastWorkout.weights.reduce((sum, w) => sum + w, 0) * 8 // Assuming 8 reps
    
    // Calculate personal best
    const personalBest = data.reduce((pb, day) => {
      const dayMax = Math.max(...day.weights)
      return Math.max(pb, dayMax)
    }, 0)

    // Calculate average weight trend (last 4 workouts)
    const recentWorkouts = data.slice(0, 4)
    const avgWeight = recentWorkouts.reduce((sum, day) => 
      sum + Math.max(...day.weights), 0) / recentWorkouts.length

    return {
      maxWeight,
      volume,
      personalBest,
      avgWeight: Math.round(avgWeight),
      daysAgo: Math.round((new Date() - lastWorkout.date) / (1000 * 60 * 60 * 24))
    }
  }, [logs, exercise.name])

  if (!stats) return null

  return (
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <div className="text-gray-500">Current</div>
        <div className="font-medium">{stats.maxWeight} lbs</div>
      </div>
      <div>
        <div className="text-gray-500">Personal Best</div>
        <div className="font-medium">{stats.personalBest} lbs</div>
      </div>
      <div>
        <div className="text-gray-500">4-Day Avg</div>
        <div className="font-medium">{stats.avgWeight} lbs</div>
      </div>
    </div>
  )
}

const ExerciseCard = ({
  exercise,
  log,
  onComplete,
  onWeightChange,
  showProgress,
  onToggleProgress,
  logs,
  hidden,
  selectedDate,
}) => {
  if (!exercise || hidden) return null

  const getStats = () => {
    const data = []
    let personalBest = 0
    let totalVolume = 0
    let sessionsCount = 0
    
    Object.entries(logs)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .forEach(([date, exercises]) => {
        if (exercises[exercise.name]) {
          const weights = exercises[exercise.name].weights.map(w => parseFloat(w) || 0)
          const maxWeight = Math.max(...weights)
          const dayVolume = weights.reduce((sum, weight) => sum + weight, 0) * 8 // Assuming 8 reps per set
          
          if (maxWeight > 0) {
            personalBest = Math.max(personalBest, maxWeight)
            totalVolume += dayVolume
            sessionsCount++
            
            data.push({
              date,
              weight: maxWeight,
              volume: dayVolume
            })
          }
        }
      })

    return {
      personalBest,
      averageVolume: sessionsCount ? Math.round(totalVolume / sessionsCount) : 0,
      lastWeight: data.length ? data[data.length - 1].weight : 0,
      progress: data.length >= 2 ? 
        Math.round(((data[data.length - 1].weight - data[0].weight) / data[0].weight) * 100) : 0
    }
  }

  const stats = getStats()

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleProgress}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={log.completed ? 'default' : 'outline'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onComplete()
              }}
              className="w-9 h-9 p-0"
            >
              {log.completed ? <Check className="h-4 w-4" /> : null}
            </Button>
            <div>
              <h3 className="font-medium">{exercise.name}</h3>
              <p className="text-sm text-gray-500">{exercise.sets}</p>
            </div>
          </div>
          <ExerciseStats exercise={exercise} logs={logs} />
        </div>
      </div>

      {showProgress && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Personal Best</div>
              <div className="font-medium">{stats.personalBest} lbs</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Current Weight</div>
              <div className="font-medium">{stats.lastWeight} lbs</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Avg. Volume/Session</div>
              <div className="font-medium">{stats.averageVolume} lbs</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Progress</div>
              <div className={`font-medium ${stats.progress >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.progress > 0 ? '+' : ''}{stats.progress}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {[0, 1, 2].map((setIndex) => (
              <div key={setIndex} className="flex items-center gap-2">
                <span className="text-sm w-16">Set {setIndex + 1}:</span>
                <select
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={log.weights[setIndex]}
                  onChange={(e) => onWeightChange(setIndex, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Select</option>
                  {[...Array(61)].map((_, i) => (
                    <option key={i * 5} value={i * 5}>
                      {i * 5} lbs
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium mb-2">Progress History</h4>
            <ProgressChart logs={logs} exerciseName={exercise.name} />
          </div>
        </div>
      )}
    </div>
  )
}

const WorkoutManager = ({
  type,
  exercises,
  onAddExercise,
  onRemoveExercise,
  onToggleExercise,
  hiddenExercises,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newExerciseSets, setNewExerciseSets] = useState('3x8-12')

  const handleAddExercise = (e) => {
    e.preventDefault()
    if (newExerciseName.trim()) {
      onAddExercise(type, {
        name: newExerciseName.trim(),
        sets: newExerciseSets,
      })
      setNewExerciseName('')
      setNewExerciseSets('3x8-12')
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage {type} Exercises</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <Save className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <form
            onSubmit={handleAddExercise}
            className="flex gap-2 items-end mb-4"
          >
            <div className="flex-1">
              <Input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="New exercise name"
              />
            </div>
            <div className="w-32">
              <Input
                type="text"
                value={newExerciseSets}
                onChange={(e) => setNewExerciseSets(e.target.value)}
                placeholder="3x8-12"
              />
            </div>
            <Button type="submit">Add</Button>
          </form>
        )}
        <div className="space-y-2">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExercise(exercise.name)}
                >
                  {hiddenExercises.includes(exercise.name) ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
                <span
                  className={
                    hiddenExercises.includes(exercise.name)
                      ? 'text-gray-400'
                      : ''
                  }
                >
                  {exercise.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{exercise.sets}</span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveExercise(type, exercise.name)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const WorkoutApp = () => {
  const [user, setUser] = useState(null)
  const [selectedDay, setSelectedDay] = useState('push')
  const [workoutLogs, setWorkoutLogs] = useState({})
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [timeRange, setTimeRange] = useState(TimeRange.MONTH)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [customWorkouts, setCustomWorkouts] = useState(initialWorkoutData)
  const [hiddenExercises, setHiddenExercises] = useState([])
  const [showWorkoutManager, setShowWorkoutManager] = useState(false)
  const [personalStats, setPersonalStats] = useState({
    bodyWeight: '',
    height: '',
    age: '',
    experience: 'beginner',
    personalBests: {
      benchPress: '',
      squat: '',
      deadlift: '',
      overheadPress: ''
    }
  })
  const [goals, setGoals] = useState({
    benchPress: '',
    squat: '',
    deadlift: '',
    overheadPress: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState('')

  const syncData = () => {
    if (!user) return;
    
    const userData = {
      ...user,
      workoutLogs,
      customWorkouts,
      hiddenExercises,
      personalStats,
      goals,
      profileImage
    }
    
    localStorage.setItem(`user_${user.username}`, JSON.stringify(userData))
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const fetchData = () => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      return JSON.parse(currentUser)
    }
    return null
  }

  const handleDataLoad = async () => {
    const data = await fetchData();
    if (data) {
      setWorkoutData(data);
    } else {
      // Handle the error state
      setError('Failed to load workout data');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (!savedUser) return

    try {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setWorkoutLogs(userData.workoutLogs || {})
      setCustomWorkouts(userData.customWorkouts || initialWorkoutData)
      setHiddenExercises(userData.hiddenExercises || [])
      setPersonalStats(userData.personalStats || {})
      setGoals(userData.goals || {})
      if (userData.profileImage) {
        setProfileImage(userData.profileImage)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      syncData();
    }
  }, [workoutLogs, customWorkouts, hiddenExercises, personalStats, goals, profileImage]);

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('currentUser', JSON.stringify(userData))

    // Load complete user data including workout logs
    const userDataFull = localStorage.getItem(`user_${userData.username}`)
    if (userDataFull) {
      const {
        workoutLogs: savedLogs,
        customWorkouts: savedWorkouts,
        hiddenExercises: savedHidden,
      } = JSON.parse(userDataFull)
      setWorkoutLogs(savedLogs || {})
      if (savedWorkouts) setCustomWorkouts(savedWorkouts)
      if (savedHidden) setHiddenExercises(savedHidden)
    }
  }

  const handleLogout = () => {
    if (user) {
      const userData = {
        username: user.username,
        password: user.password,
        workoutLogs,
        customWorkouts,
        hiddenExercises,
        personalStats,
        goals,
        profileImage
      }
      localStorage.setItem(`user_${user.username}`, JSON.stringify(userData))
    }
    
    setUser(null)
    setWorkoutLogs({})
    setCustomWorkouts(initialWorkoutData)
    setHiddenExercises([])
    localStorage.removeItem('currentUser')
  }

  const handleAddExercise = (type, exercise) => {
    setCustomWorkouts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        exercises: [...prev[type].exercises, exercise],
      },
    }))
  }

  const handleRemoveExercise = (type, exerciseName) => {
    setCustomWorkouts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        exercises: prev[type].exercises.filter((e) => e.name !== exerciseName),
      },
    }))
  }

  const toggleExerciseVisibility = (exerciseName) => {
    setHiddenExercises((prev) =>
      prev.includes(exerciseName)
        ? prev.filter((name) => name !== exerciseName)
        : [...prev, exerciseName]
    )
  }

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getExerciseLog = (exerciseName) => {
    return (
      workoutLogs[selectedDate]?.[exerciseName] || {
        completed: false,
        weights: ['', '', ''],
      }
    )
  }

  const toggleExerciseCompletion = (exerciseName) => {
    const currentLog = workoutLogs[selectedDate]?.[exerciseName] || {
      completed: false,
      weights: ['', '', ''],
    }
    setWorkoutLogs((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [exerciseName]: {
          ...currentLog,
          completed: !currentLog.completed,
        },
      },
    }))
  }

  const updateWeight = (exerciseName, setIndex, weight) => {
    const currentLog = workoutLogs[selectedDate]?.[exerciseName] || {
      completed: false,
      weights: ['', '', ''],
    }
    const newWeights = [...currentLog.weights]
    newWeights[setIndex] = weight

    setWorkoutLogs((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [exerciseName]: {
          ...currentLog,
          weights: newWeights,
        },
      },
    }))
  }

  const exportData = () => {
    const userData = {
      username: user.username,
      workoutLogs,
      customWorkouts,
      hiddenExercises
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result || '');
        
        // Validate imported data structure
        if (!importedData.workoutLogs || !importedData.customWorkouts) {
          throw new Error('Invalid data format');
        }

        setWorkoutLogs(importedData.workoutLogs);
        setCustomWorkouts(importedData.customWorkouts);
        setHiddenExercises(importedData.hiddenExercises || []);

        // Save to localStorage
        const userData = {
          ...user,
          workoutLogs: importedData.workoutLogs,
          customWorkouts: importedData.customWorkouts,
          hiddenExercises: importedData.hiddenExercises || []
        };
        localStorage.setItem(`user_${user.username}`, JSON.stringify(userData));

        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="h-6 w-6" />
          PPL Workout Tracker
        </h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWorkoutManager(!showWorkoutManager)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            {showWorkoutManager ? 'Hide Manager' : 'Manage'}
          </Button>
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="flex-1 sm:flex-none"
            >
              <User className="h-4 w-4 mr-1" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex-1 sm:flex-none"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="flex-1 sm:flex-none"
            >
              Export
            </Button>
            <label className="cursor-pointer flex-1 sm:flex-none">
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={importData}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <span>Import</span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        {formatDisplayDate(selectedDate)}
      </p>

      {showWorkoutManager && (
        <WorkoutManager
          type={selectedDay}
          exercises={customWorkouts[selectedDay].exercises}
          onAddExercise={handleAddExercise}
          onRemoveExercise={handleRemoveExercise}
          onToggleExercise={toggleExerciseVisibility}
          hiddenExercises={hiddenExercises}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={
                    timeRange === TimeRange.MONTH ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setTimeRange(TimeRange.MONTH)}
                >
                  Month
                </Button>
                <Button
                  variant={timeRange === TimeRange.YEAR ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(TimeRange.YEAR)}
                >
                  Year
                </Button>
              </div>
              {timeRange === TimeRange.MONTH && (
                <select
                  className="w-40 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={selectedMonth.getMonth()}
                  onChange={(e) => {
                    const newDate = new Date(selectedMonth)
                    newDate.setMonth(parseInt(e.target.value))
                    setSelectedMonth(newDate)
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => ({
                    value: i,
                    label: new Date(2024, i).toLocaleString('default', {
                      month: 'long',
                    }),
                  })).map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <HeatmapChart
              logs={workoutLogs}
              timeRange={timeRange}
              selectedMonth={selectedMonth}
              onDayClick={(date) =>
                setSelectedDate(date.toISOString().split('T')[0])
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Button
          variant={selectedDay === 'push' ? 'default' : 'outline'}
          onClick={() => setSelectedDay('push')}
          className="w-full"
        >
          Push
        </Button>
        <Button
          variant={selectedDay === 'pull' ? 'default' : 'outline'}
          onClick={() => setSelectedDay('pull')}
          className="w-full"
        >
          Pull
        </Button>
        <Button
          variant={selectedDay === 'legs' ? 'default' : 'outline'}
          onClick={() => setSelectedDay('legs')}
          className="w-full"
        >
          Legs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{customWorkouts[selectedDay].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customWorkouts[selectedDay].exercises.map((exercise, index) => (
            <ExerciseCard
              key={index}
              exercise={exercise}
              log={getExerciseLog(exercise.name)}
              onComplete={() => toggleExerciseCompletion(exercise.name)}
              onWeightChange={(setIndex, weight) =>
                updateWeight(exercise.name, setIndex, weight)
              }
              showProgress={selectedExercise === exercise.name}
              onToggleProgress={() =>
                setSelectedExercise(
                  selectedExercise === exercise.name ? null : exercise.name
                )
              }
              logs={workoutLogs}
              hidden={hiddenExercises.includes(exercise.name)}
              selectedDate={selectedDate}
            />
          ))}
        </CardContent>
      </Card>

      {isSyncing && (
        <div className="text-sm text-gray-500">
          Syncing...
        </div>
      )}
    </div>
  )
}

export default WorkoutApp
