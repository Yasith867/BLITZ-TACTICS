import { motion } from 'framer-motion'
import Card from '../components/Card'
import { mockCards } from '../data/cards'

export default function Collection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg p-8">
      <div className="container mx-auto max-w-7xl">
        <motion.h1 
          className="text-4xl font-game gradient-text mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          MY COLLECTION
        </motion.h1>

        <div className="mb-6 flex gap-4">
          <button className="px-6 py-2 bg-electric-blue rounded-lg font-bold">All Cards</button>
          <button className="px-6 py-2 bg-dark-surface border border-electric-blue/30 rounded-lg">Creatures</button>
          <button className="px-6 py-2 bg-dark-surface border border-electric-blue/30 rounded-lg">Spells</button>
          <button className="px-6 py-2 bg-dark-surface border border-electric-blue/30 rounded-lg">Counters</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
            >
              <Card card={card} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-dark-surface rounded-lg border border-neon-purple/30">
          <h2 className="text-2xl font-bold mb-4 text-neon-purple">Collection Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-electric-blue">{mockCards.length}</div>
              <div className="text-sm text-gray-400">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-purple">5</div>
              <div className="text-sm text-gray-400">Rare Cards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-accent">100%</div>
              <div className="text-sm text-gray-400">Collection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
