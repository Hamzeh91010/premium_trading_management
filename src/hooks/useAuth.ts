import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: {
    id: '1',
    email: 'admin@tradingbot.pro',
    name: 'John Doe',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  isAuthenticated: true,
  isLoading: false,
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const user: User = {
      id: '1',
      email,
      name: 'John Doe',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
    set({ user, isAuthenticated: true, isLoading: false })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  setUser: (user: User) => {
    set({ user })
  },
}))