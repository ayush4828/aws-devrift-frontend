import { AuthProvider } from './authContext.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import ProjectRoutes from './Routes.jsx';
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'react-hot-toast'
createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Router>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#122131',
            color: '#d4e4fa',
            border: '1px solid rgba(132, 148, 149, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
          },
          success: {
            iconTheme: { primary: '#00dbe9', secondary: '#122131' },
          },
          error: {
            iconTheme: { primary: '#ffb4ab', secondary: '#122131' },
          }
        }}
      />
      <ProjectRoutes />
    </Router>
  </AuthProvider>
)
