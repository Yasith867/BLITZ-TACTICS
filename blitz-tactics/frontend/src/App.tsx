import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GameBoard from './pages/GameBoard'
import Dashboard from './pages/Dashboard'
import Collection from './pages/Collection'
import Header from './components/Header'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GameBoard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
