# D&D 5e Text Adventure

A multiplayer terminal-based dungeon crawler built with Node.js, Socket.io, and D&D 5e mechanics.

## How to Play

### Prerequisites
- Node.js installed
- Two players on the same network

### Running the Server

```bash
cd dnd-text-adventure
npm start
```

The server will start on port 3000 and display the local IP address.

### Connecting

1. **Host**: Opens browser to `http://localhost:3000`
2. **Client**: Opens browser to `http://<HOST_IP>:3000`

Both players enter their names when prompted.

### Starting the Game

1. Both players type `/start` when ready
2. Both players type `/roll` to generate their character stats (4d6 drop lowest)
3. Game begins automatically

## Commands

| Command | Action |
|---------|--------|
| `n` / `s` / `e` / `w` | Move north/south/east/west |
| `look` | Examine current room |
| `attack` | Attack enemy in room |
| `cast heal` | Cast heal spell (restores HP) |
| `cast fireball` | Cast fireball (area damage) |
| `stats` | View your character sheet |
| `rest` | Rest to recover HP |

## Character Creation

- **Stats**: Roll 4d6, drop lowest for each ability (STR, DEX, CON, INT, WIS, CHA)
- **HP**: d8 + CON modifier
- **AC**: 10 + DEX modifier

## Game Features

- Turn-based exploration (Player 1 → Player 2 → repeat)
- Random 5x5 maze with enemies and traps
- Boss battle in final room
- Two spells: Heal and Fireball
- Victory or defeat conditions

## Tech Stack

- Node.js
- Express
- Socket.io
- Vanilla JavaScript (terminal UI)

## License

MIT
