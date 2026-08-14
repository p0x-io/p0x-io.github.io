const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Game State
let players = [];
let gameState = 'lobby'; // lobby, character_creation, playing, combat, victory, defeat
let currentTurn = 0;
let maze = [];
let playerRooms = {};
let enemies = [];
let bossDefeated = false;

// Constants
const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const SKILLS = {
    athletics: 'strength',
    acrobatics: 'dexterity',
    stealth: 'dexterity',
    perception: 'wisdom',
    persuasion: 'charisma',
    intimidation: 'charisma'
};
const WEAPONS = {
    sword: { damage: '1d8', attackBonus: 5, type: 'melee' },
    bow: { damage: '1d8', attackBonus: 5, type: 'ranged' },
    axe: { damage: '1d10', attackBonus: 5, type: 'melee' }
};
const SPELLS = {
    heal: { heal: '1d8', slots: 2, name: 'Heal' },
    fireball: { damage: '2d6', save: 'dexterity', slots: 2, name: 'Fireball' }
};

// Utility functions
function rollDice(dice) {
    const match = dice.match(/(\d+)d(\d+)/);
    if (!match) return 0;
    const [_, numDice, numSides] = match;
    let total = 0;
    for (let i = 0; i < parseInt(numDice); i++) {
        total += Math.floor(Math.random() * parseInt(numSides)) + 1;
    }
    return total;
}

function roll4d6DropLowest() {
    const rolls = [rollDice('1d6'), rollDice('1d6'), rollDice('1d6'), rollDice('1d6')];
    rolls.sort((a, b) => b - a);
    return rolls[0] + rolls[1] + rolls[2];
}

function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

function generateMaze() {
    const size = 5;
    maze = [];
    for (let y = 0; y < size; y++) {
        maze[y] = [];
        for (let x = 0; x < size; x++) {
            const rand = Math.random();
            let room = { x, y, visited: false, description: '' };
            
            if (rand < 0.3) {
                room.type = 'empty';
                room.description = 'A cold stone chamber. Dust motes float in the stale air.';
            } else if (rand < 0.5) {
                room.type = 'enemy';
                room.description = 'An enemy lurks in the shadows!';
                room.enemy = createEnemy();
            } else if (rand < 0.65) {
                room.type = 'loot';
                room.description = 'You find a chest in the corner.';
                room.loot = 'potion';
            } else {
                room.type = 'trap';
                room.description = 'The floor looks unstable...';
            }
            maze[y][x] = room;
        }
    }
    // Boss room
    maze[size-1][size-1].type = 'boss';
    maze[size-1][size-1].description = 'THE BOSS awaits!';
    maze[size-1][size-1].enemy = createBoss();
    
    // Start room
    maze[0][0].type = 'start';
    maze[0][0].description = 'You enter the dungeon. The exit is sealed behind you.';
}

function createEnemy() {
    const types = ['goblin', 'skeleton', 'zombie'];
    const type = types[Math.floor(Math.random() * types.length)];
    const hp = Math.floor(Math.random() * 6) + 4;
    return {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        hp: hp,
        maxHp: hp,
        ac: 12,
        attackBonus: 4,
        damage: '1d6+2',
        isBoss: false
    };
}

function createBoss() {
    return {
        name: 'Goblin King',
        hp: 20,
        maxHp: 20,
        ac: 14,
        attackBonus: 5,
        damage: '1d10+3',
        isBoss: true
    };
}

function getAdjacentRooms(x, y) {
    const rooms = [];
    if (y > 0) rooms.push({ dir: 'north', x, y: y - 1 });
    if (y < 4) rooms.push({ dir: 'south', x, y: y + 1 });
    if (x > 0) rooms.push({ dir: 'west', x: x - 1, y });
    if (x < 4) rooms.push({ dir: 'east', x: x + 1, y });
    return rooms;
}

function broadcast(message) {
    io.emit('game message', message);
}

function sendToPlayer(socketId, message) {
    io.to(socketId).emit('game message', message);
}

// Socket.io handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    if (players.length >= 2) {
        socket.emit('game message', 'Game is full. Try again later.');
        socket.disconnect();
        return;
    }
    
    players.push({ id: socket.id, name: null, character: null, ready: false });
    
    if (players.length === 1) {
        socket.emit('game message', 'Waiting for second player...\nHost your IP: ' + getLocalIP());
    } else {
        broadcast('Second player connected! Type /start to begin.');
    }
    
    socket.on('set name', (name) => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            player.name = name;
            broadcast(`${name} has joined the game!`);
        }
    });
    
    socket.on('start game', () => {
        if (players.length === 2 && players.every(p => p.ready)) {
            gameState = 'character_creation';
            broadcast('=== CHARACTER CREATION ===\nType /roll to roll 4d6 stats\nType /done when finished');
        }
    });
    
    socket.on('roll stats', () => {
        if (gameState !== 'character_creation') return;
        
        const player = players.find(p => p.id === socket.id);
        if (!player) return;
        
        const stats = {};
        ABILITIES.forEach(ability => {
            stats[ability] = roll4d6DropLowest();
        });
        
        const hp = 8 + getModifier(stats.constitution); // d8 hit die + CON
        const ac = 10 + getModifier(stats.dexterity);
        
        player.character = {
            name: player.name || 'Hero',
            stats: stats,
            hp: hp,
            maxHp: hp,
            ac: ac,
            weapon: 'sword',
            spells: { heal: 2, fireball: 2 },
            proficiency: 2
        };
        
        player.ready = true;
        sendToPlayer(socket.id, `Stats rolled for ${player.name}:\n` +
            `STR: ${stats.strength} (${getModifier(stats.strength) >= 0 ? '+' : ''}${getModifier(stats.strength)})\n` +
            `DEX: ${stats.dexterity} (${getModifier(stats.dexterity) >= 0 ? '+' : ''}${getModifier(stats.dexterity)})\n` +
            `CON: ${stats.constitution} (${getModifier(stats.constitution) >= 0 ? '+' : ''}${getModifier(stats.constitution)})\n` +
            `INT: ${stats.intelligence} (${getModifier(stats.intelligence) >= 0 ? '+' : ''}${getModifier(stats.intelligence)})\n` +
            `WIS: ${stats.wisdom} (${getModifier(stats.wisdom) >= 0 ? '+' : ''}${getModifier(stats.wisdom)})\n` +
            `CHA: ${stats.charisma} (${getModifier(stats.charisma) >= 0 ? '+' : ''}${getModifier(stats.charisma)})\n` +
            `HP: ${hp} | AC: ${ac}\n` +
            `Type /done when ready.`);
        
        if (players.every(p => p.ready)) {
            startGame();
        }
    });
    
    socket.on('command', (cmd) => {
        if (gameState !== 'playing') return;
        
        const player = players.find(p => p.id === socket.id);
        if (!player || !player.character) return;
        
        // Check if it's player's turn
        const playerIndex = players.indexOf(player);
        if (playerIndex !== currentTurn) {
            sendToPlayer(socket.id, "It's not your turn!");
            return;
        }
        
        processCommand(player, cmd);
    });
    
    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        if (players.length < 2) {
            gameState = 'lobby';
            broadcast('Player disconnected. Game reset.');
        }
    });
});

function startGame() {
    gameState = 'playing';
    generateMaze();
    
    players.forEach((p, i) => {
        playerRooms[p.id] = { x: 0, y: 0 };
    });
    
    enemies = [];
    
    // Place enemies in maze
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (maze[y][x].enemy && !maze[y][x].enemy.isBoss) {
                enemies.push({ ...maze[y][x].enemy, x, y });
            }
        }
    }
    
    broadcast('=== DUNGEON OF DOOM ===\nFind the boss and defeat it!\nType n/s/e/w to move, look to see room, attack to fight.');
    currentTurn = 0;
    showCurrentRoom(players[0]);
}

function showCurrentRoom(player) {
    const room = playerRooms[player.id];
    if (!room) return;
    
    const cell = maze[room.y][room.x];
    let msg = `\n--- ${cell.description} ---\n`;
    
    // Show enemies in room
    const roomEnemies = enemies.filter(e => e.x === room.x && e.y === room.y);
    roomEnemies.forEach(e => {
        msg += `[ENEMY: ${e.name} HP:${e.hp}/${e.maxHp} AC:${e.ac}]\n`;
    });
    
    // Show exits
    const exits = getAdjacentRooms(room.x, room.y);
    msg += `Exits: ${exits.map(e => e.dir).join(', ')}\n`;
    msg += `\n${player.name}'s turn!`;
    
    sendToPlayer(player.id, msg);
    
    // Show other player the game state
    const otherPlayer = players.find(p => p.id !== player.id);
    if (otherPlayer) {
        let otherMsg = `\n--- ${cell.description} ---\n`;
        roomEnemies.forEach(e => {
            otherMsg += `[ENEMY: ${e.name} HP:${e.hp}/${e.maxHp} AC:${e.ac}]\n`;
        });
        otherMsg += `Exits: ${exits.map(e => e.dir).join(', ')}\n`;
        otherMsg += `\n${player.name}'s turn...`;
        sendToPlayer(otherPlayer.id, otherMsg);
    }
}

function processCommand(player, cmd) {
    const args = cmd.toLowerCase().split(' ');
    const action = args[0];
    const room = playerRooms[player.id];
    const cell = maze[room.y][room.x];
    const roomEnemies = enemies.filter(e => e.x === room.x && e.y === room.y);
    
    switch (action) {
        case 'n':
        case 'north':
            if (room.y > 0) {
                room.y--;
                broadcast(`${player.name} moves north.`);
            } else {
                sendToPlayer(player.id, "You can't go that way.");
                return;
            }
            break;
        case 's':
        case 'south':
            if (room.y < 4) {
                room.y++;
                broadcast(`${player.name} moves south.`);
            } else {
                sendToPlayer(player.id, "You can't go that way.");
                return;
            }
            break;
        case 'e':
        case 'east':
            if (room.x < 4) {
                room.x++;
                broadcast(`${player.name} moves east.`);
            } else {
                sendToPlayer(player.id, "You can't go that way.");
                return;
            }
            break;
        case 'w':
        case 'west':
            if (room.x > 0) {
                room.x--;
                broadcast(`${player.name} moves west.`);
            } else {
                sendToPlayer(player.id, "You can't go that way.");
                return;
            }
            break;
        case 'look':
            showCurrentRoom(player);
            nextTurn();
            return;
        case 'attack':
            if (roomEnemies.length === 0) {
                sendToPlayer(player.id, "No enemies here!");
                return;
            }
            attackEnemy(player, roomEnemies[0]);
            nextTurn();
            return;
        case 'cast':
            const spell = args[1];
            if (!spell) {
                sendToPlayer(player.id, "Cast what? Use: cast heal or cast fireball");
                return;
            }
            castSpell(player, spell, roomEnemies);
            nextTurn();
            return;
        case 'stats':
            const c = player.character;
            sendToPlayer(player.id, `=== ${c.name} ===\nHP: ${c.hp}/${c.maxHp} | AC: ${c.ac}\nSTR: ${c.stats.strength} | DEX: ${c.stats.dexterity} | CON: ${c.stats.constitution}\nINT: ${c.stats.intelligence} | WIS: ${c.stats.wisdom} | CHA: ${c.stats.charisma}\nSpells: Heal(${c.spells.heal}) Fireball(${c.spells.fireball})`);
            return;
        case 'rest':
            const heal = rollDice('1d8') + getModifier(c.stats.constitution);
            c.hp = Math.min(c.hp + heal, c.maxHp);
            sendToPlayer(player.id, `You rest and heal ${heal} HP! (${c.hp}/${c.maxHp})`);
            broadcast(`${player.name} rests and recovers.`);
            nextTurn();
            return;
        default:
            sendToPlayer(player.id, "Unknown command. Try: n/s/e/w, look, attack, cast heal, cast fireball, stats, rest");
            return;
    }
    
    showCurrentRoom(player);
}

function attackEnemy(player, enemy) {
    const weapon = WEAPONS[player.character.weapon];
    const attackRoll = rollDice('1d20') + weapon.attackBonus + player.character.proficiency;
    const damage = rollDice(weapon.damage) + getModifier(player.character.stats.strength);
    
    let msg = `${player.name} attacks ${enemy.name}... `;
    
    if (attackRoll >= enemy.ac) {
        msg += `HIT! ${damage} damage!\n`;
        enemy.hp -= damage;
        
        if (enemy.hp <= 0) {
            msg += `${enemy.name} is defeated!`;
            enemies = enemies.filter(e => e !== enemy);
            
            // Check for boss
            if (enemy.isBoss) {
                gameState = 'victory';
                broadcast('\n=== VICTORY! ===\nThe boss is defeated! You win!');
            }
        }
    } else {
        msg += `MISS!`;
    }
    
    broadcast(msg);
    
    // Enemy counterattack
    if (enemy.hp > 0 && enemies.filter(e => e.x === enemy.x && e.y === enemy.y).length > 0) {
        const enemyAttack = rollDice('1d20') + enemy.attackBonus;
        if (enemyAttack >= player.character.ac) {
            const enemyDamage = rollDice(enemy.damage);
            player.character.hp -= enemyDamage;
            broadcast(`${enemy.name} attacks ${player.name} for ${enemyDamage} damage! (${player.character.hp}/${player.character.maxHp})`);
            
            if (player.character.hp <= 0) {
                gameState = 'defeat';
                broadcast('\n=== DEFEAT ===\nYou have fallen... Game over.');
            }
        } else {
            broadcast(`${enemy.name} misses ${player.name}!`);
        }
    }
}

function castSpell(player, spellName, roomEnemies) {
    const c = player.character;
    const spell = SPELLS[spellName];
    
    if (!spell) {
        sendToPlayer(player.id, `Unknown spell: ${spellName}. Available: heal, fireball`);
        return;
    }
    
    if (c.spells[spellName] <= 0) {
        sendToPlayer(player.id, `No ${spellName} spells remaining!`);
        return;
    }
    
    c.spells[spellName]--;
    
    if (spellName === 'heal') {
        const healAmount = rollDice(spell.heal) + getModifier(c.stats.wisdom);
        c.hp = Math.min(c.hp + healAmount, c.maxHp);
        sendToPlayer(player.id, `You cast Heal! +${healAmount} HP (${c.hp}/${c.maxHp})`);
        broadcast(`${player.name} casts Heal and recovers ${healAmount} HP!`);
    } else if (spellName === 'fireball') {
        if (roomEnemies.length === 0) {
            sendToPlayer(player.id, "No targets for fireball!");
            c.spells[spellName]++; // Refund
            return;
        }
        
        const damage = rollDice(spell.damage);
        roomEnemies.forEach(e => {
            e.hp -= damage;
            broadcast(`${player.name} casts Fireball on ${e.name} for ${damage} damage!`);
        });
        
        enemies = enemies.filter(e => {
            if (e.hp <= 0) {
                broadcast(`${e.name} is destroyed by the flames!`);
                return false;
            }
            return true;
        });
    }
    
    // Enemy counterattack after spell
    const room = playerRooms[player.id];
    const roomEnemies2 = enemies.filter(e => e.x === room.x && e.y === room.y);
    if (roomEnemies2.length > 0) {
        const enemy = roomEnemies2[Math.floor(Math.random() * roomEnemies2.length)];
        const enemyAttack = rollDice('1d20') + enemy.attackBonus;
        if (enemyAttack >= c.ac) {
            const enemyDamage = rollDice(enemy.damage);
            c.hp -= enemyDamage;
            broadcast(`${enemy.name} attacks ${player.name} for ${enemyDamage} damage! (${c.hp}/${c.maxHp})`);
            
            if (c.hp <= 0) {
                gameState = 'defeat';
                broadcast('\n=== DEFEAT ===\nYou have fallen... Game over.');
            }
        }
    }
}

function nextTurn() {
    if (gameState !== 'playing') return;
    currentTurn = (currentTurn + 1) % players.length;
    showCurrentRoom(players[currentTurn]);
}

function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`D&D Server running on port ${PORT}`);
    console.log(`Host on: http://localhost:${PORT}`);
    console.log(`Or connect via local IP`);
});
