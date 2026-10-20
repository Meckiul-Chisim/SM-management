import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { WorkspaceProvider } from '../context/WorkspaceContext.jsx'

function App() {
  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
    </WorkspaceProvider>
  )
}

export default App
