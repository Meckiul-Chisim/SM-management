import { createContext } from 'react'

// The workspace value is provided by WorkspaceProvider and read with useWorkspace().
// It lives in its own file so component files only export components.
export const WorkspaceContext = createContext(null)
