import { motion } from 'framer-motion'

interface CardProps {
  card: {
    id: number
    name: string
    description: string
    attack: number
    defense: number
    cost: number
    cardType: string
  }
}

export default function Card({ card }: CardProps) {
  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'Creature': return 'from-green-500 to-emerald-600'
      case 'Spell': return 'from-red-500 to-orange-600'
      case 'Counter': return 'from-blue-500 to-cyan-600'
      case 'Buff': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="relative w-40 h-56 bg-dark-surface rounded-lg overflow-hidden border-2 border-electric-blue shadow-lg card-glow">
      {/* Cost Badge */}
      <div className="absolute top-2 left-2 w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center font-bold text-lg z-10">
        {card.cost}
      </div>

      {/* Card Type Banner */}
      <div className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-r ${getCardTypeColor(card.cardType)}`} />

      {/* Card Content */}
      <div className="p-3 pt-18 relative z-0 h-full flex flex-col justify-between">
        <div className="mt-10">
          <h3 className="font-bold text-sm mb-2 text-white">{card.name}</h3>
          <p className="text-xs text-gray-300 line-clamp-2">{card.description}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mt-auto">
          {card.attack > 0 && (
            <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded">
              <span className="text-xs">⚔️</span>
              <span className="font-bold text-sm">{card.attack}</span>
            </div>
          )}
          {card.defense > 0 && (
            <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded">
              <span className="text-xs">🛡️</span>
              <span className="font-bold text-sm">{card.defense}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
