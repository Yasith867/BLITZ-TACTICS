import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-game gradient-text mb-6"
            animate={{ 
              textShadow: [
                '0 0 20px rgba(14, 165, 233, 0.5)',
                '0 0 40px rgba(168, 85, 247, 0.5)',
                '0 0 20px rgba(14, 165, 233, 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            BLITZ TACTICS
          </motion.h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Real-Time Strategy Card Battler
          </p>
          
          <p className="text-md text-electric-blue mb-8 font-semibold">
            Powered by Linera Microchains • Sub-0.5s Finality
          </p>

          <div className="max-w-3xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                title="⚡ Real-Time"
                description="Instant card plays with <0.5s transaction finality"
                delay={0.2}
              />
              <FeatureCard
                title="⛓️ Microchains"
                description="Each player gets their own dedicated blockchain"
                delay={0.4}
              />
              <FeatureCard
                title="🤖 AI Opponents"
                description="Smart AI powered by Linera native oracles"
                delay={0.6}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={() => navigate('/game')}
              className="px-8 py-4 bg-gradient-to-r from-electric-blue to-neon-purple 
                       rounded-lg text-xl font-bold shadow-lg card-glow
                       hover:shadow-2xl transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎮 Play Now
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-dark-surface border-2 border-electric-blue
                       rounded-lg text-xl font-bold
                       hover:bg-electric-blue/20 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 Dashboard
            </motion.button>

            <motion.button
              onClick={() => navigate('/collection')}
              className="px-8 py-4 bg-dark-surface border-2 border-neon-purple
                       rounded-lg text-xl font-bold
                       hover:bg-neon-purple/20 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🃏 My Collection
            </motion.button>
          </div>

          <div className="mt-16 p-6 bg-dark-surface/50 rounded-lg border border-electric-blue/30 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-electric-blue">🏆 Buildathon Features</h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Player Microchains</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Cross-Chain Messaging</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">GraphQL Services</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Event Streams</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">AI Oracles</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Instant Counters</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, delay }: { title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-6 bg-dark-surface rounded-lg border border-electric-blue/30 
                 hover:border-neon-purple card-glow-purple transition-all duration-300"
      whileHover={{ scale: 1.05 }}
    >
      <h3 className="text-lg font-bold mb-2 text-electric-blue">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </motion.div>
  )
}
