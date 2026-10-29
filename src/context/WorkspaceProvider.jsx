import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { STORAGE_KEY } from '../data/constants.js'
import { createSampleWorkspace } from '../data/sampleData.js'
import { getBrowserStorage, loadWorkspace, saveWorkspace } from '../data/storage.js'
import { workspaceReducer } from '../data/workspaceReducer.js'
import { createId } from '../utils/id.js'
import { WorkspaceContext } from './workspaceContext.js'

// Holds the workspace, saves every change to localStorage, and keeps other open
// tabs in step. Pages never touch storage directly; they call the actions below.
export function WorkspaceProvider({ children }) {
  const [initial] = useState(() => loadWorkspace())
  const [data, dispatch] = useReducer(workspaceReducer, initial.data)
  const [notice, setNotice] = useState(initial.notice)
  const [saveFailed, setSaveFailed] = useState(false)

  // The last workspace that is known to match storage. When loading produced a warning
  // (damaged or unavailable storage) the loaded data is NOT written straight back, so a
  // damaged save is never overwritten before the person has seen the warning. Otherwise
  // the first visit stores the sample workspace right away.
  const lastSaved = useRef(initial.notice ? initial.data : null)

  useEffect(() => {
    if (data === lastSaved.current) return
    lastSaved.current = data
    setSaveFailed(!saveWorkspace(data).ok)
  }, [data])

  // Another tab changed the workspace: adopt its version instead of overwriting it later.
  useEffect(() => {
    function onStorage(event) {
      if (event.key !== STORAGE_KEY || event.storageArea !== getBrowserStorage()) return
      const { data: next } = loadWorkspace()
      lastSaved.current = next
      dispatch({ type: 'workspace/replace', data: next })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const actions = useMemo(() => ({
    renameWorkspace: (name) => dispatch({ type: 'workspace/rename', name }),
    replaceWorkspace: (next) => dispatch({ type: 'workspace/replace', data: next }),
    clearWorkspace: () => dispatch({ type: 'workspace/clear' }),
    removeSampleData: () => dispatch({ type: 'workspace/removeSample' }),
    resetToSample: () => dispatch({ type: 'workspace/replace', data: createSampleWorkspace() }),

    addBrand(values) {
      const id = createId()
      dispatch({ type: 'brand/add', brand: { ...values, id, createdAt: new Date().toISOString(), isSample: false } })
      return id
    },
    updateBrand: (id, changes) => dispatch({ type: 'brand/update', id, changes }),
    deleteBrand: (id, { removeRecords = false } = {}) => dispatch({ type: 'brand/delete', id, removeRecords }),

    addPost(values) {
      const id = createId()
      const now = new Date().toISOString()
      dispatch({ type: 'post/add', post: { ...values, id, createdAt: now, updatedAt: now, isSample: false } })
      return id
    },
    updatePost: (id, changes) => dispatch({ type: 'post/update', id, changes, updatedAt: new Date().toISOString() }),
    deletePost: (id) => dispatch({ type: 'post/delete', id }),

    addInteraction(values) {
      const id = createId()
      dispatch({ type: 'interaction/add', interaction: { ...values, id, createdAt: new Date().toISOString(), isSample: false } })
      return id
    },
    updateInteraction: (id, changes) => dispatch({ type: 'interaction/update', id, changes }),
    deleteInteraction: (id) => dispatch({ type: 'interaction/delete', id }),
  }), [])

  const dismissNotice = useCallback(() => setNotice(null), [])

  const value = useMemo(
    () => ({ data, notice, dismissNotice, saveFailed, ...actions }),
    [data, notice, dismissNotice, saveFailed, actions],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
