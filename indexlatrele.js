const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const express = require('express') 

// Render requires an open web port, so we spin up a tiny web server
const app = express()
app.get('/', (req, res) => res.send('Shadow_Knight Status: Operational'))
app.listen(process.env.PORT || 3000, () => console.log('Keep-alive server listening.'))

const config = {
  host: 'TheGakuranSchoolClub.aternos.me', 
  port: 31153,
  username: 'Daddy_Ryzen',
  version: '1.21' 
}

const MASTER = 'GamerBoyJona' 

function startBot() {
  console.log(`Starting instance...`);
  const bot = mineflayer.createBot(config)

  // Load plugins freshly on every instance startup
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvp)

  bot.on('chat', (username, message) => {
    if (username !== MASTER) return 
    const args = message.split(' ')
    
    if (message.startsWith('$follow')) {
      const target = bot.players[args[1]]?.entity
      if (target) {
        bot.pathfinder.setGoal(new goals.GoalFollow(target, 2), true)
        bot.chat(`Following ${args[1]}`)
      } else {
        bot.chat(`I can't see ${args[1]}!`)
      }
    }
    
    if (message.startsWith('$hunting')) {
      const target = bot.players[args[1]]?.entity
      if (target) {
        bot.pvp.attack(target)
        bot.chat(`Target locked on ${args[1]}!`)
      } else {
        bot.chat(`I can't find ${args[1]} to hunt!`)
      }
    }
    
    if (message === '$stop') {
      bot.pathfinder.setGoal(null)
      bot.pvp.stop()
      bot.chat('Stopping all actions.')
    }
  })

  bot.once('spawn', () => {
    console.log('Shadow_Knight is ready to serve!')
    setTimeout(() => {
      bot.chat('/register Pass123 Pass123') 
      bot.chat('/login Pass123')
    }, 1500);
    const defaultMove = new Movements(bot)
    bot.pathfinder.setMovements(defaultMove)
  })

  // Cleanly disconnect and clear old instances before starting a new one
  bot.on('end', (reason) => {
    console.warn(`[DISCONNECT] Reason: ${reason}. Reconnecting in 15 seconds...`);
    bot.removeAllListeners(); // Prevents memory leak glitches
    setTimeout(startBot, 15000);
  })

  bot.on('error', (err) => console.error(`[SOCKET ERROR] ${err.message}`))
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection:', reason);
});

startBot();
