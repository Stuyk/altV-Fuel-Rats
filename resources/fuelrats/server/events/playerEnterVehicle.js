import * as alt from 'alt';
import chalk from 'chalk';

alt.log(chalk.greenBright('Loaded: events/playerEnterVehicle'));
alt.on('playerEnteredVehicle', playerEnterVehicle);

function playerEnterVehicle(player, vehicle) {
    if (!player || !player.valid || player.disconnected) {
        return;
    }

    alt.setTimeout(() => {
        vehicle.engineOn = true;
    }, 500);
}
