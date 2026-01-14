'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({})
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [newKeyValue, setNewKeyValue] = useState('')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})


  const AI_PROVIDERS = [
    { id: 'gemini', name: 'Google Gemini', url: 'https://makersuite.google.com/app/apikey' },
    { id: 'groq', name: 'Groq Cloud', url: 'https://console.groq.com' },
    { id: 'google-translate', name: 'Google Translate', url: '' }, // Added
    { id: 'together', name: 'Together AI', url: 'https://www.together.ai' },
    { id: 'openai', name: 'OpenAI / Claude', url: 'https://platform.openai.com' },
    { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/settings/tokens' },
  ]

  useEffect(() => {
    if (isOpen) {
      setProviderKeys(storage.getAllProviderKeys())
    }
  }, [isOpen])

  const handleDeleteKey = (providerId: string) => {
    if (confirm(`আপনি কি এই প্রোভাইডারের (${providerId}) সংরক্ষিত কী মুছে ফেলবেন?`)) {
      storage.removeProviderKey(providerId)
      setProviderKeys(storage.getAllProviderKeys())
    }
  }

  const handleUpdateKey = (providerId: string) => {
    if (!newKeyValue.trim()) {
      alert('অনুগ্রহ করে একটি API কী প্রবেশ করুন')
      return
    }
    storage.saveProviderKey(providerId, newKeyValue.trim())
    setProviderKeys(storage.getAllProviderKeys())
    setEditingProvider(null)
    setNewKeyValue('')
    alert('সফলভাবে আপডেট করা হয়েছে!')
  }

  const toggleShowKey = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[110] p-3 sm:p-4">
      <div className="glass-card rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-white/20 bg-white/40">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">API Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-button text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
            <p><strong>💡 টিপ:</strong> প্রতিটি AI প্রোভাইডারের জন্য আলাদা কী এখানে সংরক্ষণ করতে পারেন। এগুলো আপনার ব্রাউজারে সুরক্ষিত থাকে।</p>
          </div>

          <div className="space-y-4">
            {AI_PROVIDERS.map((provider) => (
              <div key={provider.id} className="glass-panel border border-white/20 rounded-2xl p-4 transition-all hover:bg-white/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{provider.name}</h4>
                    {provider.url && (
                      <a 
                        href={provider.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
                        Get Key ↗
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {provider.id === 'google-translate' ? (
                      <span className="px-3 py-1.5 text-xs font-bold bg-emerald-100/60 text-emerald-700 rounded-lg border border-emerald-200 backdrop-blur-sm">
                        Free
                      </span>
                    ) : providerKeys[provider.id] ? (
                      <>
                        <button
                          onClick={() => toggleShowKey(provider.id)}
                          className="px-3 py-1.5 text-xs font-bold glass-button rounded-lg text-indigo-600"
                        >
                          {showKeys[provider.id] ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProvider(provider.id)
                            setNewKeyValue(providerKeys[provider.id] || '')
                          }}
                          className="px-3 py-1.5 text-xs font-bold glass-button rounded-lg text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteKey(provider.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingProvider(provider.id)}
                        className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-105 transition-all shadow-md"
                      >
                        Add Key +
                      </button>
                    )}
                  </div>
                </div>

                {providerKeys[provider.id] && !editingProvider && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-2 flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-xs text-green-700 font-medium">কী সংরক্ষিত আছে</span>
                    {showKeys[provider.id] && (
                      <span className="text-[10px] font-mono text-gray-500 truncate ml-2">
                        ({providerKeys[provider.id]})
                      </span>
                    )}
                  </div>
                )}

                {editingProvider === provider.id && (
                  <div className="mt-3 space-y-3 p-3 bg-white border rounded-lg shadow-sm">
                    <input
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder={`${provider.name} API কী প্রবেশ করুন`}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateKey(provider.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-xs sm:text-sm"
                      >
                        সংরক্ষণ করুন
                      </button>
                      <button
                        onClick={() => {
                          setEditingProvider(null)
                          setNewKeyValue('')
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">নিরাপত্তার তথ্য</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span>আপনার সব API কী ব্রাউজারে স্থানীয়ভাবে সংরক্ষিত</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span>তথ্য কখনও আমাদের সার্ভারে আপলোড হয় না</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-white/40 border-t border-white/20 flex flex-col gap-4">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-100 transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
