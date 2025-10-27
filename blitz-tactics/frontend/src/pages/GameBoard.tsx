import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'
import { mockCards } from '../data/cards'

export default function GameBoard() {
  const [playerHealth, setPlayerHealth] = useState(20)
  const [opponentHealth, setOpponentHealth] = useState(20)
  const [playerMana, setPlayerMana] = useState(3)
  const [turnTimer, setTurnTimer] = useState(5)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [hand, setHand] = useState(mockCards.slice(0, 5))
  const [field, setField] = useState<any[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          setIsPlayerTurn(!isPlayerTurn)
          return 5
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlayerTurn])

  const playCard = (card: any) => {
    if (playerMana >= card.cost && isPlayerTurn) {
      setPlayerMana(playerMana - card.cost)
      setField([...field, card])
      setHand(hand.filter(c => c.id !== card.id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Opponent Area */}
        <div className="mb-4">
          <div className="flex justify-between items-center bg-dark-surface p-4 rounded-lg border-2 border-neon-purple">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">🤖 AI Opponent</div>
              <HealthBar health={opponentHealth} maxHealth={20} />
            </div>
            <div className="text-xl font-bold text-neon-purple">Mana: 3</div>
          </div>
          
          {/* Opponent Field */}
          <div className="mt-2 grid grid-cols-5 gap-2 min-h-[150px] bg-dark-bg/50 p-4 rounded-lg border border-neon-purple/30">
            <div className="text-center text-gray-400 col-span-5 my-auto">Opponent's Field</div>
          </div>
        </div>

        {/* Turn Timer */}
        <div className="my-6">
          <div className="text-center">
            <motion.div
              className={`inline-block px-8 py-4 rounded-lg ${
                isPlayerTurn ? 'bg-electric-blue' : 'bg-neon-purple'
              } font-bold text-2xl`}
              animate={{ scale: turnTimer <= 2 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: turnTimer <= 2 ? Infinity : 0 }}
            >
              {isPlayerTurn ? '⚡ YOUR TURN' : '⏳ OPPONENT TURN'} - {turnTimer}s
            </motion.div>
          </div>
        </div>

        {/* Player Field */}
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-2 min-h-[150px] bg-dark-bg/50 p-4 rounded-lg border border-electric-blue/30">
            <AnimatePresence>
              {field.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Card card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
            {field.length === 0 && (
              <div className="text-center text-gray-400 col-span-5 my-auto">Your Field (Play cards here)</div>
            )}
          </div>
          
          <div className="flex justify-between items-center bg-dark-surface p-4 rounded-lg border-2 border-electric-blue mt-2">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">⚔️ You</div>
              <HealthBar health={playerHealth} maxHealth={20} />
            </div>
            <div className="text-xl font-bold text-electric-blue">Mana: {playerMana}/10</div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="mt-6">
          <div className="text-center text-lg font-bold mb-2 text-gold-accent">YOUR HAND</div>
          <div className="flex gap-4 justify-center overflow-x-auto pb-4">
            <AnimatePresence>
              {hand.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  onClick={() => playCard(card)}
                  className="cursor-pointer"
                >
                  <Card card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-4 p-4 bg-dark-surface/50 rounded-lg border border-electric-blue/30">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-400">Turn</div>
              <div className="font-bold text-electric-blue">1</div>
            </div>
            <div>
              <div className="text-gray-400">Cards Played</div>
              <div className="font-bold text-neon-purple">{field.length}</div>
            </div>
            <div>
              <div className="text-gray-400">Deck Remaining</div>
              <div className="font-bold text-gold-accent">15</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  const percentage = (health / maxHealth) * 100

  return (
    <div className="flex items-center gap-2">
      <div className="text-lg font-bold">❤️ {health}</div>
      <div className="w-32 h-4 bg-dark-bg rounded-full overflow-hidden border border-gray-600">
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 to-pink-500"
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}
