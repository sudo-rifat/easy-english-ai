// LocalStorage utility for saving API keys and preferences

export interface SavedCredentials {
  apiKey: string
  aiProvider: string
  timestamp: number
}

// Map of provider ID to API key
export interface ProviderKeys {
  [key: string]: string
}

const STORAGE_KEY = 'easy-english-credentials'
const PROVIDER_KEY = 'easy-english-provider'
const KEYS_MAP_KEY = 'easy-english-provider-keys'

export const storage = {
  // Save specific provider key
  saveProviderKey: (providerId: string, apiKey: string) => {
    if (typeof window === 'undefined') return
    try {
      const keys = storage.getAllProviderKeys()
      keys[providerId] = apiKey
      localStorage.setItem(KEYS_MAP_KEY, JSON.stringify(keys))
      // Also set as the last used provider
      localStorage.setItem(PROVIDER_KEY, providerId)
    } catch (error) {
      console.error('Failed to save provider key:', error)
    }
  },

  // Get specific provider key
  getProviderKey: (providerId: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      const keys = storage.getAllProviderKeys()
      return keys[providerId] || null
    } catch (error) {
      return null
    }
  },

  // Get all provider keys
  getAllProviderKeys: (): ProviderKeys => {
    if (typeof window === 'undefined') return {}
    try {
      const data = localStorage.getItem(KEYS_MAP_KEY)
      if (data) {
        return JSON.parse(data)
      }
      
      // Migration: check for old single key
      const oldData = localStorage.getItem(STORAGE_KEY)
      if (oldData) {
        const credentials: SavedCredentials = JSON.parse(oldData)
        if (credentials.apiKey && credentials.aiProvider) {
          const keys: ProviderKeys = { [credentials.aiProvider]: credentials.apiKey }
          // Don't save yet, just return so it can be used/integrated
          return keys
        }
      }
    } catch (error) {
      console.error('Failed to get provider keys:', error)
    }
    return {}
  },

  // Remove specific provider key
  removeProviderKey: (providerId: string) => {
    if (typeof window === 'undefined') return
    try {
      const keys = storage.getAllProviderKeys()
      delete keys[providerId]
      localStorage.setItem(KEYS_MAP_KEY, JSON.stringify(keys))
    } catch (error) {
      console.error('Failed to remove provider key:', error)
    }
  },

  // Legacy support & utilities
  saveCredentials: (apiKey: string, aiProvider: string) => {
    storage.saveProviderKey(aiProvider, apiKey)
  },

  getSavedApiKey: (): string | null => {
    const provider = storage.getSavedProvider() || 'gemini'
    return storage.getProviderKey(provider)
  },

  getSavedProvider: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(PROVIDER_KEY)
  },

  clearCredentials: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(KEYS_MAP_KEY)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PROVIDER_KEY)
  },

  hasCredentials: (): boolean => {
    const keys = storage.getAllProviderKeys()
    return Object.keys(keys).length > 0
  },
}
