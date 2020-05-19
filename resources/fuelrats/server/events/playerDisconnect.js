import * as alt from 'alt';
import chalk from 'chalk';

alt.log(chalk.greenBright('Loaded: events/playerDisconnect'));
alt.on('playerDisconnect', playerDisconnect);

function playerDisconnect(player) {
    player.disconnected = true;

    if (!player || !player.valid) {
        return;
    }

    if (player.vehicle && player.vehicle.valid) {
        player.vehicle.destroy();
    }

    if (player.canister) {
        player.canister.dropCanister();
    }

    alt.log(`${player.name} has disconnected from the server.`);
}
