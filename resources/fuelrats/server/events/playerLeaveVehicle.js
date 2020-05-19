import * as alt from 'alt';
import chalk from 'chalk';

alt.log(chalk.greenBright('Loaded: events/playerLeftVehicle'));
alt.on('playerLeftVehicle', playerLeftVehicle);

function playerLeftVehicle(player) {
    if (!player || !player.valid || player.disconnected) {
        return;
    }

    if (player.lastVehicle) {
        player.setIntoVehicle(player.lastVehicle);
    }
}
