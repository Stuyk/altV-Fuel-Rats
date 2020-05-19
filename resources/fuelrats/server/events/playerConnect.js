import * as alt from 'alt';
import chalk from 'chalk';

alt.log(chalk.greenBright('Loaded: events/playerConnect'));
alt.on('playerConnect', playerConnect);

function playerConnect(player) {
    alt.log(`${player.name} has connected to the server.`);
    alt.emitClient(player, 'chat:Init');

    player.send(`Welcome to the server!`);
    player.send(`This is an {FFFF00}ENGLISH {FFFFFF}server so speak ENGLISH in the main chat.`);
}
