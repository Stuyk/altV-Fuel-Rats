import alt from 'alt';
import chalk from 'chalk';

alt.log(chalk.greenBright('Loaded: systems/chat'));

let commands = {};

alt.onClient('chat:Send', chatSend);
alt.on('chat:SendAll', sendAll);

/**
 * Register commands for players to use.
 * @param  {string} commandName
 * @param  {string} description
 * @param  {Function} callback
 */
export function registerCmd(commandName, description, callback) {
    commandName = commandName.toLowerCase();
    if (commands[commandName] !== undefined) {
        alt.logError(`Failed to register command /${commandName}, already registered`);
        return;
    }

    commands[commandName] = {
        callback,
        description
    };
}

function invokeCmd(player, commandName, args) {
    commandName = commandName.toLowerCase();
    if (!commands[commandName]) {
        player.send(`{FF0000} Unknown command /${commandName}`);
        return;
    }

    const callback = commands[commandName].callback;
    if (typeof callback !== 'function') {
        player.send(`{FF0000} Unknown command /${commandName}`);
        return;
    }

    callback(player, args);
}

function chatSend(player, msg) {
    if (!player.lastMessage) {
        player.lastMessage = Date.now() + 5000;
    } else {
        if (Date.now() < player.lastMessage) {
            player.send(`{FF0000}You are sending messages too quickly. 5s per message.`);
            return;
        }
    }

    if (msg[0] === '/') {
        alt.log(`[Command] ${player.name} ${msg}`);
        msg = msg.trim().slice(1);

        if (msg.length > 0) {
            let args = msg.split(' ');
            let commandName = args.shift();
            invokeCmd(player, commandName, args);
        }
        return;
    }

    msg = msg.trim();
    if (msg.length <= 0) {
        return;
    }

    alt.log(`[Message] ${player.data.username}: ${msg}`);

    // Cleanse Message
    msg = msg
        .replace(/</g, '&lt;')
        .replace(/'/g, '&#39')
        .replace(/"/g, '&#34');

    alt.emitClient(null, 'chat:Send', `${player.data.username} says: ${msg}`);
}

function sendAll(message) {
    alt.log(message);

    const players = [...alt.Player.all];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        player.send(message);
    }
}
