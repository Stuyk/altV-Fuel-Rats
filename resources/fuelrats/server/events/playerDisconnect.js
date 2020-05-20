import * as alt from 'alt';
import chalk from 'chalk';

alt.log(chalk.greenBright('Loaded: events/playerDisconnect'));
alt.on('playerDisconnect', playerDisconnect);

function playerDisconnect(player) {
    player.disconnected = true;
    alt.emitClient(null, 'player:RemoveBlip', player);

    if (!player || !player.valid) {
        return;
    }

    if (player.data) {
        alt.emit('chat:SendAll', `{BE6EFF}[INFO]{FFFFFF} ${player.data.username} has left the game.`);
    }

    if (player.vehicle && player.vehicle.valid) {
        player.vehicle.destroy();
    }

    if (player.canister) {
        player.canister.drop(player.pos);
    }

    if (player.tickInterval) {
        alt.clearInterval(player.tickInterval);
    }

    alt.log(`${player.name} has disconnected from the server.`);
}
