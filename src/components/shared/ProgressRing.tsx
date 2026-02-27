interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference

  const ringColor = color || (
    percentage >= 100 ? '#EF4444' :
    percentage >= 80 ? '#F59E0B' :
    '#22C55E'
  )

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-stone-200 dark:text-stone-700"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-stone-800 dark:text-white font-mono">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mt-2">
          {label}
        </p>
      )}
      {sublabel && (
        <p className="text-xs text-stone-400">{sublabel}</p>
      )}
    </div>
  )
}
