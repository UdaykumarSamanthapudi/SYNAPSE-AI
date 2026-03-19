import { Navigate, Route, Routes } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage'
import { ChatPage } from './pages/ChatPage.tsx'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
