'use client'

export type Theme = 'modern-blue' | 'classic-green' | 'elegant-purple'

interface ThemeSelectorProps {
  selectedTheme: Theme
  onThemeChange: (theme: Theme) => void
}

export default function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-gray-200/50 shadow-sm">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Theme</span>
      <div className="flex gap-2">
        <button
          onClick={() => onThemeChange('modern-blue')}
          className={`w-8 h-8 rounded-full bg-blue-600 border-2 transition-all hover:scale-110 ${selectedTheme === 'modern-blue' ? 'border-gray-800 ring-2 ring-blue-200' : 'border-white shadow-sm'}`}
          title="Modern Blue"
        />
        <button
          onClick={() => onThemeChange('classic-green')}
          className={`w-8 h-8 rounded-full bg-green-700 border-2 transition-all hover:scale-110 ${selectedTheme === 'classic-green' ? 'border-gray-800 ring-2 ring-green-200' : 'border-white shadow-sm'}`}
          title="Classic Green"
        />
        <button
          onClick={() => onThemeChange('elegant-purple')}
          className={`w-8 h-8 rounded-full bg-purple-700 border-2 transition-all hover:scale-110 ${selectedTheme === 'elegant-purple' ? 'border-gray-800 ring-2 ring-purple-200' : 'border-white shadow-sm'}`}
          title="Elegant Purple"
        />
      </div>
    </div>
  )
}
