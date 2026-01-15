'use client'

export type Theme = 'modern-blue' | 'classic-green' | 'elegant-purple' | 'sunset-orange' | 'rose-red' | 'ocean-teal' | 'midnight-slate'

interface ThemeSelectorProps {
  selectedTheme: Theme
  onThemeChange: (theme: Theme) => void
}

const themes = [
  { id: 'modern-blue' as Theme, name: 'Electric Blue', color: 'bg-[#3b82f6]', ring: 'ring-blue-300' },
  { id: 'classic-green' as Theme, name: 'Emerald', color: 'bg-[#22c55e]', ring: 'ring-green-300' },
  { id: 'elegant-purple' as Theme, name: 'Violet', color: 'bg-[#a855f7]', ring: 'ring-purple-300' },
  { id: 'sunset-orange' as Theme, name: 'Orange', color: 'bg-[#f97316]', ring: 'ring-orange-300' },
  { id: 'rose-red' as Theme, name: 'Rose', color: 'bg-[#f43f5e]', ring: 'ring-rose-300' },
  { id: 'ocean-teal' as Theme, name: 'Teal', color: 'bg-[#14b8a6]', ring: 'ring-teal-300' },
  { id: 'midnight-slate' as Theme, name: 'Indigo', color: 'bg-[#6366f1]', ring: 'ring-indigo-300' },
]

export default function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-gray-200/60 shadow-lg">
      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider px-1 hidden sm:block">Theme</span>
      <div className="flex gap-1.5 sm:gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`
              w-7 h-7 sm:w-9 sm:h-9 rounded-full ${theme.color} 
              border-2 border-white shadow-md
              transition-all duration-200 ease-out
              hover:scale-110 hover:shadow-lg
              active:scale-95
              ${selectedTheme === theme.id 
                ? `ring-4 ${theme.ring} scale-110` 
                : 'opacity-80 hover:opacity-100'
              }
            `}
            title={theme.name}
          />
        ))}
      </div>
    </div>
  )
}
