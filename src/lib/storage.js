const STORAGE_KEYS = {
  USER: 'user',
  WORKOUTS: 'workouts',
  LOGS: 'workout_logs',
  STATS: 'personal_stats',
  GOALS: 'goals'
}

export const storage = {
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null
    } catch {
      return null
    }
  },

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  getWorkouts: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS)) || {}
    } catch {
      return {}
    }
  },

  setWorkouts: (workouts) => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
  },

  getLogs: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || {}
    } catch {
      return {}
    }
  },

  setLogs: (logs) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs))
  },

  getStats: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || {
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
      }
    } catch {
      return {
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
      }
    }
  },

  setStats: (stats) => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  },

  getGoals: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS)) || {
        benchPress: '',
        squat: '',
        deadlift: '',
        overheadPress: ''
      }
    } catch {
      return {
        benchPress: '',
        squat: '',
        deadlift: '',
        overheadPress: ''
      }
    }
  },

  setGoals: (goals) => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
  },

  clear: () => {
    localStorage.clear()
  }
} 