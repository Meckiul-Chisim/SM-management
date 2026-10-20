import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'haven-social-workspace-v1'

export const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'X', 'Pinterest']

function localDateOffset(days, hour = 10) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function createInitialData() {
  return {
    workspaceName: 'Haven',
    brands: [
      {
        id: 'brand-northstar',
        name: 'Northstar Studio',
        industry: 'Creative services',
        color: '#32645f',
        accounts: [
          { platform: 'Instagram', handle: '@northstarstudio', connected: false },
          { platform: 'LinkedIn', handle: 'Northstar Studio', connected: false },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'brand-sunday',
        name: 'Sunday Supply',
        industry: 'Lifestyle retail',
        color: '#a46f45',
        accounts: [
          { platform: 'Instagram', handle: '@sundaysupply', connected: false },
          { platform: 'Pinterest', handle: '@sundaysupply', connected: false },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
    posts: [
      {
        id: 'post-welcome',
        title: 'A little introduction',
        caption: 'Good work starts with a clear idea. Here is a little look at what we are building, why it matters, and what is coming next.',
        brandId: 'brand-northstar',
        platform: 'Instagram',
        status: 'Draft',
        scheduledAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'post-behind-scenes',
        title: 'Behind the scenes',
        caption: 'A small look at the people, details, and decisions behind the finished work. What part of the process would you like to see next?',
        brandId: 'brand-northstar',
        platform: 'LinkedIn',
        status: 'Planned',
        scheduledAt: localDateOffset(2, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'post-weekend',
        title: 'Weekend edit',
        caption: 'A few details we keep coming back to: thoughtful design, useful ideas, and making the everyday a little better.',
        brandId: 'brand-sunday',
        platform: 'Instagram',
        status: 'Ready',
        scheduledAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    interactions: [
      {
        id: 'interaction-demo',
        person: 'Mina Patel',
        platform: 'Instagram',
        brandId: 'brand-sunday',
        message: 'Do you have this in another colour?',
        status: 'Follow up',
        followUpDate: localDateOffset(1, 14).slice(0, 10),
        notes: 'Example record — replace with your own follow-up.',
        createdAt: new Date().toISOString(),
      },
    ],
  }
}

function validData(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray(value.brands) &&
    Array.isArray(value.posts) &&
    Array.isArray(value.interactions)
  )
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (validData(parsed)) return { ...createInitialData(), ...parsed }
    }
  } catch {
    // If browser storage is unavailable or corrupted, use a fresh local workspace.
  }
  return createInitialData()
}

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const [data, setData] = useState(loadData)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // The app remains usable during the session if storage is full or blocked.
    }
  }, [data])

  const value = useMemo(() => ({
    data,
    setWorkspaceName(name) {
      setData((current) => ({ ...current, workspaceName: name }))
    },
    addBrand(brand) {
      const now = new Date().toISOString()
      setData((current) => ({
        ...current,
        brands: [{ ...brand, id: crypto.randomUUID(), createdAt: now }, ...current.brands],
      }))
    },
    updateBrand(id, updates) {
      setData((current) => ({
        ...current,
        brands: current.brands.map((brand) => brand.id === id ? { ...brand, ...updates } : brand),
      }))
    },
    deleteBrand(id) {
      setData((current) => ({
        ...current,
        brands: current.brands.filter((brand) => brand.id !== id),
        posts: current.posts.filter((post) => post.brandId !== id),
        interactions: current.interactions.filter((item) => item.brandId !== id),
      }))
    },
    addPost(post) {
      const now = new Date().toISOString()
      setData((current) => ({
        ...current,
        posts: [{ ...post, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...current.posts],
      }))
    },
    updatePost(id, updates) {
      setData((current) => ({
        ...current,
        posts: current.posts.map((post) => post.id === id
          ? { ...post, ...updates, updatedAt: new Date().toISOString() }
          : post),
      }))
    },
    deletePost(id) {
      setData((current) => ({ ...current, posts: current.posts.filter((post) => post.id !== id) }))
    },
    addInteraction(interaction) {
      setData((current) => ({
        ...current,
        interactions: [{ ...interaction, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current.interactions],
      }))
    },
    updateInteraction(id, updates) {
      setData((current) => ({
        ...current,
        interactions: current.interactions.map((item) => item.id === id ? { ...item, ...updates } : item),
      }))
    },
    deleteInteraction(id) {
      setData((current) => ({
        ...current,
        interactions: current.interactions.filter((item) => item.id !== id),
      }))
    },
    replaceData(nextData) {
      if (validData(nextData)) setData({ ...createInitialData(), ...nextData })
    },
    resetWorkspace() {
      setData(createInitialData())
    },
  }), [data])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return context
}
