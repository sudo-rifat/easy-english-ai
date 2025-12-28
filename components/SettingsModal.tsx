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
    setIsMounted(true)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">API কী সেটিংস</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
            <p><strong>💡 টিপ:</strong> প্রতিটি AI প্রোভাইডারের জন্য আলাদা কী এখানে সংরক্ষণ করতে পারেন। এগুলো আপনার ব্রাউজারে সুরক্ষিত থাকে।</p>
          </div>

          <div className="space-y-4">
            {AI_PROVIDERS.map((provider) => (
              <div key={provider.id} className="border rounded-xl p-3 sm:p-4 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">{provider.name}</h4>
                    {provider.url && (
                      <a 
                        href={provider.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        কী পেতে এখানে ক্লিক করুন ↗
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {provider.id === 'google-translate' ? (
                      <span className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-lg border border-green-200">
                        বিনামূল্যে (Free)
                      </span>
                    ) : providerKeys[provider.id] ? (
                      <>
                        <button
                          onClick={() => toggleShowKey(provider.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          {showKeys[provider.id] ? 'লুকান' : 'দেখান'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProvider(provider.id)
                            setNewKeyValue(providerKeys[provider.id] || '')
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          পরিবর্তন
                        </button>
                        <button
                          onClick={() => handleDeleteKey(provider.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                          মুছুন
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingProvider(provider.id)}
                        className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        কী যোগ করুন +
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

        <button
          onClick={onClose}
          className="w-full mt-8 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl transition text-sm sm:text-base shadow-lg"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  )
}
