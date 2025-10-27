import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="bg-dark-surface border-b-2 border-electric-blue shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.h1 
              className="text-2xl md:text-3xl font-game gradient-text"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              BLITZ TACTICS
            </motion.h1>
          </Link>
          
          <nav className="flex gap-4 md:gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/collection">Collection</NavLink>
            <NavLink to="/game">Play</NavLink>
          </nav>
        </div>
        
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Powered by Linera Microchains</span>
        </div>
      </div>
    </header>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}>
      <motion.div
        className="px-4 py-2 rounded-lg bg-dark-hover hover:bg-electric-blue/20 
                   border border-electric-blue/30 hover:border-electric-blue 
                   transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="font-semibold text-sm">{children}</span>
      </motion.div>
    </Link>
  )
}
