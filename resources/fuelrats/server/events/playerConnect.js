import * as alt from 'alt';
import chalk from 'chalk';

const ips = [];

alt.log(chalk.greenBright('Loaded: events/playerConnect'));
alt.on('playerConnect', playerConnect);
alt.on('kicked:AddIP', handleAddToIP);

function playerConnect(player) {
    if (!player) {
        player.kick();
        return false;
    }

    if (ips.includes(player.ip)) {
        player.kick();
        return false;
    }

    player.setSyncedMeta('pause', true);
    player.emit('panel:Registration');
    player.send(`Welcome to the server!`);
    player.send(`This is an {FFFF00}ENGLISH {FFFFFF}server so speak ENGLISH in the main chat.`);
}

function handleAddToIP(ip) {
    if (ips.includes(ip)) {
        return;
    }

    const players = [...alt.Player.all];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        if (!player.votedFor || !Array.isArray(player.votedFor) || !player.votedFor.includes(ip)) {
            continue;
        }

        const index = player.votedFor.findIndex(i => i === ip);
        if (index <= -1) {
            continue;
        }

        player.votedFor.splice(index, 1);
    }

    ips.push(ip);
    alt.setTimeout(() => {
        const index = ips.findIndex(i => i === ip);
        if (index <= -1) {
            return;
        }

        ips.splice(index, 1);
    }, 60000 * 5);
}
