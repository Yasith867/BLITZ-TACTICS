import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'
import { mockCards } from '../data/cards'

export default function GameBoard() {
  const [playerHealth, setPlayerHealth] = useState(20)
  const [opponentHealth, setOpponentHealth] = useState(20)
  const [playerMana, setPlayerMana] = useState(3)
  const [opponentMana, setOpponentMana] = useState(3)
  const [maxMana, setMaxMana] = useState(3)
  const [turnTimer, setTurnTimer] = useState(5)
  const [turnNumber, setTurnNumber] = useState(1)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  
  const [playerHand, setPlayerHand] = useState(mockCards.slice(0, 4))
  const [playerField, setPlayerField] = useState<any[]>([])
  const [playerDeck, setPlayerDeck] = useState(mockCards.slice(4))
  
  const [opponentHand, setOpponentHand] = useState(mockCards.slice(0, 4))
  const [opponentField, setOpponentField] = useState<any[]>([])
  const [opponentDeck, setOpponentDeck] = useState(mockCards.slice(4))

  const [message, setMessage] = useState<string>('')

  // Show message temporarily
  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2000)
  }

  // Draw card from deck
  const drawCard = (isPlayer: boolean) => {
    if (isPlayer && playerDeck.length > 0) {
      const newCard = playerDeck[0]
      setPlayerHand([...playerHand, newCard])
      setPlayerDeck(playerDeck.slice(1))
      showMessage('Drew a card!')
    } else if (!isPlayer && opponentDeck.length > 0) {
      const newCard = opponentDeck[0]
      setOpponentHand([...opponentHand, newCard])
      setOpponentDeck(opponentDeck.slice(1))
    }
  }

  // End turn
  const endTurn = () => {
    if (isPlayerTurn) {
      setIsPlayerTurn(false)
      setTurnTimer(5)
      // Regenerate mana for next turn
      const newMaxMana = Math.min(maxMana + 1, 10)
      setMaxMana(newMaxMana)
      setOpponentMana(newMaxMana)
      drawCard(false)
      showMessage('Opponent turn!')
    } else {
      setIsPlayerTurn(true)
      setTurnTimer(5)
      setTurnNumber(turnNumber + 1)
      const newMaxMana = Math.min(maxMana + 1, 10)
      setMaxMana(newMaxMana)
      setPlayerMana(newMaxMana)
      drawCard(true)
      showMessage('Your turn!')
    }
  }

  // Timer countdown
  useEffect(() => {
    if (gameOver) return

    const timer = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          endTurn()
          return 5
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlayerTurn, gameOver, maxMana, turnNumber])

  // AI makes a move
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && turnTimer === 3) {
      aiMakeMove()
    }
  }, [turnTimer, isPlayerTurn, gameOver])

  // Check win condition
  useEffect(() => {
    if (opponentHealth <= 0) {
      setGameOver(true)
      setWinner('player')
      showMessage('🎉 YOU WIN!')
    } else if (playerHealth <= 0) {
      setGameOver(true)
      setWinner('opponent')
      showMessage('💀 YOU LOSE!')
    }
  }, [playerHealth, opponentHealth])

  // AI logic
  const aiMakeMove = () => {
    // AI tries to play a card
    const playableCards = opponentHand.filter(card => card.cost <= opponentMana)
    
    if (playableCards.length > 0) {
      // Pick random card AI can afford
      const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)]
      
      setOpponentMana(opponentMana - randomCard.cost)
      setOpponentField([...opponentField, randomCard])
      setOpponentHand(opponentHand.filter(c => c.id !== randomCard.id))
      showMessage(`AI played ${randomCard.name}!`)
      
      // AI attacks if has creatures
      setTimeout(() => aiAttack(), 1000)
    } else {
      // Can't play, just attack
      aiAttack()
    }
  }

  const aiAttack = () => {
    if (opponentField.length > 0) {
      // AI attacks with all creatures
      let totalDamage = 0
      opponentField.forEach(card => {
        if (card.attack > 0) {
          totalDamage += card.attack
        }
      })
      
      if (totalDamage > 0) {
        setPlayerHealth(Math.max(0, playerHealth - totalDamage))
        showMessage(`AI dealt ${totalDamage} damage!`)
      }
    }
  }

  // Player plays a card
  const playCard = (card: any) => {
    if (!isPlayerTurn || gameOver) {
      showMessage('Not your turn!')
      return
    }
    
    if (playerMana < card.cost) {
      showMessage('Not enough mana!')
      return
    }

    setPlayerMana(playerMana - card.cost)
    setPlayerField([...playerField, card])
    setPlayerHand(playerHand.filter(c => c.id !== card.id))
    showMessage(`Played ${card.name}!`)
  }

  // Attack with creature
  const attackWithCreature = (attackerCard: any) => {
    if (!isPlayerTurn || gameOver) {
      showMessage('Not your turn!')
      return
    }

    if (attackerCard.attack > 0) {
      setOpponentHealth(Math.max(0, opponentHealth - attackerCard.attack))
      showMessage(`Dealt ${attackerCard.attack} damage!`)
    }
  }

  // Restart game
  const restartGame = () => {
    setPlayerHealth(20)
    setOpponentHealth(20)
    setPlayerMana(3)
    setOpponentMana(3)
    setMaxMana(3)
    setTurnTimer(5)
    setTurnNumber(1)
    setIsPlayerTurn(true)
    setGameOver(false)
    setWinner(null)
    setPlayerHand(mockCards.slice(0, 4))
    setPlayerField([])
    setPlayerDeck(mockCards.slice(4))
    setOpponentHand(mockCards.slice(0, 4))
    setOpponentField([])
    setOpponentDeck(mockCards.slice(4))
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-dark-surface p-8 rounded-lg border-4 border-gold-accent text-center"
            >
              <div className="text-6xl mb-4">{winner === 'player' ? '🏆' : '💀'}</div>
              <h2 className="text-4xl font-bold gradient-text mb-4">
                {winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
              </h2>
              <p className="text-xl mb-6">
                Final Score: You {playerHealth} - {opponentHealth} AI
              </p>
              <button
                onClick={restartGame}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg text-xl font-bold"
              >
                Play Again
              </button>
            </motion.div>
          </div>
        )}

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gold-accent text-dark-bg px-6 py-3 rounded-lg font-bold text-xl z-40 shadow-lg"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opponent Area */}
        <div className="mb-4">
          <div className="flex justify-between items-center bg-dark-surface p-4 rounded-lg border-2 border-neon-purple">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">🤖 AI Opponent</div>
              <HealthBar health={opponentHealth} maxHealth={20} />
            </div>
            <div className="text-xl font-bold text-neon-purple">Mana: {opponentMana}/{maxMana}</div>
          </div>
          
          {/* Opponent Field */}
          <div className="mt-2 grid grid-cols-5 gap-2 min-h-[150px] bg-dark-bg/50 p-4 rounded-lg border border-neon-purple/30">
            <AnimatePresence>
              {opponentField.map((card, index) => (
                <motion.div
                  key={`opp-${card.id}-${index}`}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Card card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
            {opponentField.length === 0 && (
              <div className="text-center text-gray-400 col-span-5 my-auto">Opponent's Field</div>
            )}
          </div>
          <div className="text-right text-sm text-gray-400 mt-1">Cards in hand: {opponentHand.length}</div>
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
            {isPlayerTurn && (
              <button
                onClick={endTurn}
                className="ml-4 px-6 py-3 bg-gold-accent hover:bg-gold-accent/80 rounded-lg font-bold transition-all"
              >
                End Turn
              </button>
            )}
          </div>
        </div>

        {/* Player Field */}
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-2 min-h-[150px] bg-dark-bg/50 p-4 rounded-lg border border-electric-blue/30">
            <AnimatePresence>
              {playerField.map((card, index) => (
                <motion.div
                  key={`player-${card.id}-${index}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  onClick={() => attackWithCreature(card)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                >
                  <Card card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
            {playerField.length === 0 && (
              <div className="text-center text-gray-400 col-span-5 my-auto">Your Field (Play cards here, click to attack)</div>
            )}
          </div>
          
          <div className="flex justify-between items-center bg-dark-surface p-4 rounded-lg border-2 border-electric-blue mt-2">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">⚔️ You</div>
              <HealthBar health={playerHealth} maxHealth={20} />
            </div>
            <div className="text-xl font-bold text-electric-blue">Mana: {playerMana}/{maxMana}</div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="mt-6">
          <div className="text-center text-lg font-bold mb-2 text-gold-accent">YOUR HAND (Click to play)</div>
          <div className="flex gap-4 justify-center overflow-x-auto pb-4">
            <AnimatePresence>
              {playerHand.map((card, index) => (
                <motion.div
                  key={`hand-${card.id}-${index}`}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  onClick={() => playCard(card)}
                  className={`cursor-pointer ${playerMana < card.cost ? 'opacity-50' : ''}`}
                >
                  <Card card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-4 p-4 bg-dark-surface/50 rounded-lg border border-electric-blue/30">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-400">Turn</div>
              <div className="font-bold text-electric-blue">{turnNumber}</div>
            </div>
            <div>
              <div className="text-gray-400">Your Cards</div>
              <div className="font-bold text-neon-purple">{playerField.length}</div>
            </div>
            <div>
              <div className="text-gray-400">Deck Remaining</div>
              <div className="font-bold text-gold-accent">{playerDeck.length}</div>
            </div>
            <div>
              <div className="text-gray-400">AI Cards</div>
              <div className="font-bold text-red-500">{opponentField.length}</div>
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
