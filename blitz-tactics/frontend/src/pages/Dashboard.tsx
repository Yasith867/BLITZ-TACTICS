import { motion } from 'framer-motion'

export default function Dashboard() {
  const stats = {
    wins: 15,
    losses: 8,
    draws: 2,
    ranking: 1250,
    totalMatches: 25,
    winRate: '60%',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.h1 
          className="text-4xl font-game gradient-text mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          PLAYER DASHBOARD
        </motion.h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Wins" value={stats.wins} icon="🏆" color="electric-blue" />
          <StatCard title="Total Losses" value={stats.losses} icon="💀" color="red-500" />
          <StatCard title="Draws" value={stats.draws} icon="🤝" color="gray-400" />
          <StatCard title="Ranking" value={stats.ranking} icon="⭐" color="gold-accent" />
          <StatCard title="Total Matches" value={stats.totalMatches} icon="🎮" color="neon-purple" />
          <StatCard title="Win Rate" value={stats.winRate} icon="📊" color="green-500" />
        </div>

        {/* Recent Matches */}
        <motion.div
          className="bg-dark-surface p-6 rounded-lg border border-electric-blue/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-electric-blue">Recent Matches</h2>
          
          <div className="space-y-3">
            <MatchHistory result="win" opponent="AI Opponent" date="2 hours ago" />
            <MatchHistory result="win" opponent="AI Opponent" date="5 hours ago" />
            <MatchHistory result="loss" opponent="AI Opponent" date="1 day ago" />
            <MatchHistory result="win" opponent="AI Opponent" date="1 day ago" />
            <MatchHistory result="win" opponent="AI Opponent" date="2 days ago" />
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          className="mt-8 bg-dark-surface p-6 rounded-lg border border-neon-purple/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-neon-purple">Achievements</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Achievement title="First Win" icon="🎉" unlocked={true} />
            <Achievement title="10 Wins" icon="🔥" unlocked={true} />
            <Achievement title="Speed Demon" icon="⚡" unlocked={true} />
            <Achievement title="Card Master" icon="🃏" unlocked={false} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <motion.div
      className="bg-dark-surface p-6 rounded-lg border border-electric-blue/30 card-glow"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-400 text-sm mb-1">{title}</div>
          <div className={`text-3xl font-bold text-${color}`}>{value}</div>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  )
}

function MatchHistory({ result, opponent, date }: any) {
  const isWin = result === 'win'
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${
      isWin ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
    }`}>
      <div className="flex items-center gap-4">
        <span className="text-2xl">{isWin ? '✅' : '❌'}</span>
        <div>
          <div className="font-bold">{isWin ? 'Victory' : 'Defeat'}</div>
          <div className="text-sm text-gray-400">vs {opponent}</div>
        </div>
      </div>
      <div className="text-sm text-gray-400">{date}</div>
    </div>
  )
}

function Achievement({ title, icon, unlocked }: any) {
  return (
    <div className={`p-4 rounded-lg text-center ${
      unlocked ? 'bg-gold-accent/20 border border-gold-accent' : 'bg-dark-bg/50 border border-gray-600'
    }`}>
      <div className="text-3xl mb-2 ${unlocked ? '' : 'grayscale opacity-50'}">{icon}</div>
      <div className="text-sm font-semibold">{title}</div>
      {!unlocked && <div className="text-xs text-gray-500 mt-1">Locked</div>}
    </div>
  )
}
