import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { ToastProvider } from '../context/ToastProvider.jsx'
import { WorkspaceProvider } from '../context/WorkspaceProvider.jsx'

function App() {
  return (
    <WorkspaceProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </WorkspaceProvider>
  )
}

export default App
