function ExerciseStats({ workouts, exerciseName, timeRange }) {
  // ... existing code ...

  return (
    <div className="p-6 rounded-lg bg-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{exerciseName}</h3>
        {/* ... time range buttons ... */}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Max Weight</p>
          <p className="text-2xl font-bold">{maxWeight} lbs</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-2">Avg Weight</p>
          <p className="text-2xl font-bold">{avgWeight} lbs</p>
        </div>
      </div>
    </div>
  )
} 