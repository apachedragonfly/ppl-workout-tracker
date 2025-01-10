"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { User, Activity, Calendar, Trophy, Upload, ArrowLeft, Scale, Target, History, ChevronDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { HeatmapChart } from '@/components/workout-app'
import { API_URL } from '@/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TimeRange = {
  MONTH: 'month',
  YEAR: 'year',
}

const ExerciseStats = ({ exercise, logs }) => {
  const [timeRange, setTimeRange] = useState('1M')
  const [showGraph, setShowGraph] = useState(false)
  
  const exerciseData = useMemo(() => {
    const data = []
    Object.entries(logs)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .forEach(([date, dayLog]) => {
        if (dayLog[exercise.name]) {
          const maxWeight = Math.max(
            ...dayLog[exercise.name].weights.map((w) => parseFloat(w) || 0)
          )
          if (maxWeight > 0) {
            data.push({
              date: new Date(date),
              weight: maxWeight,
              volume: dayLog[exercise.name].weights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0)
            })
          }
        }
      })

    const now = new Date()
    const months = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12
    }
    const cutoff = new Date(now.setMonth(now.getMonth() - months[timeRange]))
    return data.filter(d => d.date >= cutoff)
  }, [logs, exercise.name, timeRange])

  const stats = useMemo(() => {
    if (exerciseData.length === 0) return null
    
    const maxWeight = Math.max(...exerciseData.map(d => d.weight))
    const avgWeight = exerciseData.reduce((sum, d) => sum + d.weight, 0) / exerciseData.length

    return {
      maxWeight,
      avgWeight: Math.round(avgWeight)
    }
  }, [exerciseData])

  if (!stats) return null

  return (
    <Card className="w-full">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGraph(!showGraph)}
              className="h-8 w-8 p-0"
            >
              <TrendingUp className={`h-4 w-4 ${showGraph ? 'text-blue-500' : ''}`} />
            </Button>
          </div>
          <div className="flex gap-1">
            {['1M', '3M', '6M', '1Y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-7 px-2 text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Max Weight</p>
              <p className="text-sm font-bold">{stats.maxWeight} lbs</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Weight</p>
              <p className="text-sm font-bold">{stats.avgWeight} lbs</p>
            </div>
          </div>
          
          {showGraph && (
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} lbs`]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#2563eb" 
                    dot={false}
                    name="Weight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
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
  const [isEditingStats, setIsEditingStats] = useState(false)
  const [timeRange, setTimeRange] = useState(TimeRange.MONTH)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [selectedExercise, setSelectedExercise] = useState("Bench Press")

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      
      // Load profile data
      const savedProfile = localStorage.getItem(`profile_${userData.username}`)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setPersonalStats(profileData.personalStats || personalStats)
        setGoals(profileData.goals || goals)
      }
      
      // Load profile image
      const savedImage = localStorage.getItem(`profile_image_${userData.username}`)
      if (savedImage) {
        setProfileImage(savedImage)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`profile_${user.username}`, JSON.stringify({
        personalStats,
        goals
      }))
    }
  }, [personalStats, goals, user])

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result
        setProfileImage(imageData)
        if (user) {
          localStorage.setItem(`profile_image_${user.username}`, imageData)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateWorkoutStats = () => {
    if (!user?.workoutLogs) return null

    const workouts = Object.entries(user.workoutLogs).filter(([_, dayLog]) => 
      Object.values(dayLog).some(exercise => exercise.completed)
    )
    
    const totalWorkouts = workouts.length
    const workoutTypes = {
      push: 0,
      pull: 0,
      legs: 0
    }

    workouts.forEach(([_, workout]) => {
      if (Object.entries(workout).some(([name, exercise]) => 
        exercise.completed && user.customWorkouts.push.exercises.some(e => e.name === name)
      )) {
        workoutTypes.push++
      }
      if (Object.entries(workout).some(([name, exercise]) => 
        exercise.completed && user.customWorkouts.pull.exercises.some(e => e.name === name)
      )) {
        workoutTypes.pull++
      }
      if (Object.entries(workout).some(([name, exercise]) => 
        exercise.completed && user.customWorkouts.legs.exercises.some(e => e.name === name)
      )) {
        workoutTypes.legs++
      }
    })

    return {
      totalWorkouts,
      workoutTypes,
      consistency: calculateConsistency(workouts),
    }
  }

  const calculateConsistency = (workouts) => {
    if (workouts.length === 0) return 0
    const now = new Date()
    const firstWorkout = new Date(workouts[0][0])
    const weeks = Math.ceil((now - firstWorkout) / (1000 * 60 * 60 * 24 * 7))
    return (workouts.length / weeks).toFixed(1)
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match")
      return
    }

    try {
      const response = await fetch(`${API_URL}/users/${user.username}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setPasswordError(data.message)
        return
      }

      setIsChangingPassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordError('')
    } catch (error) {
      setPasswordError('Failed to update password')
      console.error('Password update error:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  const workoutStats = calculateWorkoutStats()

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <div className="relative group w-20 h-20 sm:w-32 sm:h-32">
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 sm:w-16 sm:h-16 text-gray-400" />
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
          </label>
        </div>

        <div className="flex-1">
          <h1 className="text-xl sm:text-3xl font-bold">{user.username}</h1>
          <p className="text-sm text-gray-500">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            {personalStats.bodyWeight && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Weight</p>
                <p className="text-sm sm:text-base font-medium">{personalStats.bodyWeight} lbs</p>
              </div>
            )}
            {personalStats.height && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Height</p>
                <p className="text-sm sm:text-base font-medium">{personalStats.height}</p>
              </div>
            )}
            {personalStats.age && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Age</p>
                <p className="text-sm sm:text-base font-medium">{personalStats.age}</p>
              </div>
            )}
            {personalStats.experience && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Experience</p>
                <p className="text-sm sm:text-base font-medium capitalize">{personalStats.experience}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Heatmap section right after profile info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workout History</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={timeRange === TimeRange.MONTH ? 'default' : 'outline'}
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeRange === TimeRange.MONTH && (
              <select
                className="w-full max-w-xs h-9 rounded-md border border-input bg-background px-3 py-1"
                value={selectedMonth.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(selectedMonth)
                  newDate.setMonth(parseInt(e.target.value))
                  setSelectedMonth(newDate)
                }}
              >
                {Array.from({ length: 12 }, (_, i) => ({
                  value: i,
                  label: new Date(2024, i).toLocaleString('default', { month: 'long' }),
                })).map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            )}
            <HeatmapChart
              logs={user.workoutLogs}
              timeRange={timeRange}
              selectedMonth={selectedMonth}
              onDayClick={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercise Statistics Section */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Exercise Statistics</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="w-[200px] bg-white border border-input">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border border-input shadow-md z-50" 
                  position="popper" 
                  side="bottom" 
                  align="start"
                  sideOffset={4}
                >
                  {Object.values(user.customWorkouts).flatMap(workout =>
                    workout.exercises.map(exercise => (
                      <SelectItem 
                        key={exercise.name} 
                        value={exercise.name}
                        className="hover:bg-gray-100"
                      >
                        {exercise.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedExercise && (
              <ExerciseStats
                key={selectedExercise}
                exercise={{ name: selectedExercise }}
                logs={user.workoutLogs}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Personal Stats Section */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span>Personal Stats</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {isEditingStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Body Weight (lbs)</label>
                      <Input
                        type="number"
                        value={personalStats.bodyWeight}
                        onChange={(e) => setPersonalStats(prev => ({
                          ...prev,
                          bodyWeight: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Height</label>
                      <Input
                        type="text"
                        value={personalStats.height}
                        onChange={(e) => setPersonalStats(prev => ({
                          ...prev,
                          height: e.target.value
                        }))}
                        placeholder="5'10''"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Age</label>
                      <Input
                        type="number"
                        value={personalStats.age}
                        onChange={(e) => setPersonalStats(prev => ({
                          ...prev,
                          age: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Experience Level</label>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1"
                        value={personalStats.experience}
                        onChange={(e) => setPersonalStats(prev => ({
                          ...prev,
                          experience: e.target.value
                        }))}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Body Weight</p>
                      <p className="font-medium">{personalStats.bodyWeight} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{personalStats.height}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{personalStats.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium capitalize">{personalStats.experience}</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingStats(!isEditingStats)}
                >
                  {isEditingStats ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Workout Statistics */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Workout Statistics</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Workout Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Push</span>
                    <span>{workoutStats?.workoutTypes.push || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pull</span>
                    <span>{workoutStats?.workoutTypes.pull || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Legs</span>
                    <span>{workoutStats?.workoutTypes.legs || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workoutStats?.consistency || 0}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    workouts/week
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workoutStats?.totalWorkouts || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Goals Section */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Goals & PRs</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['benchPress', 'squat', 'deadlift', 'overheadPress'].map((lift) => (
                  <div key={lift} className="space-y-2">
                    <h3 className="font-medium capitalize">
                      {lift.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-500">Current PR</label>
                        <Input
                          type="number"
                          value={personalStats.personalBests[lift]}
                          onChange={(e) => setPersonalStats(prev => ({
                            ...prev,
                            personalBests: {
                              ...prev.personalBests,
                              [lift]: e.target.value
                            }
                          }))}
                          placeholder="lbs"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-500">Goal</label>
                        <Input
                          type="number"
                          value={goals[lift]}
                          onChange={(e) => setGoals(prev => ({
                            ...prev,
                            [lift]: e.target.value
                          }))}
                          placeholder="lbs"
                        />
                      </div>
                    </div>
                    {personalStats.personalBests[lift] && goals[lift] && (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${Math.min(100, (personalStats.personalBests[lift] / goals[lift]) * 100)}%`
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsChangingPassword(!isChangingPassword)}
        >
          Change Password
        </Button>
        
        {isChangingPassword && (
          <div className="mt-4 space-y-4">
            <Input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
            />
            <Input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            <Button onClick={handleChangePassword}>Update Password</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage 