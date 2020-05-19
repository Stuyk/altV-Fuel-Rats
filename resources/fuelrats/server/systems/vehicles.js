import * as alt from 'alt';
import { DEFAULT_CONFIG } from '../configuration/config';

alt.onClient('vehicle:Select', selectVehicle);

function selectVehicle(player, model) {
    if (!DEFAULT_CONFIG.VALID_VEHICLES.includes(model)) {
        player.kick();
        return;
    }

    player.emit('chat:Init');
    player.send(`You have selected the vehicle: ${model}`);
    player.dimension = 0;

    if (player.vehicle && player.vehicle.valid) {
        player.vehicle.destroy();
        player.lastVehicle = null;
    }

    // TODO: RANDOM SPAWN CODE FOR VEHICLES

    try {
        const vehicle = new alt.Vehicle(model, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        player.setIntoVehicle(vehicle);
        player.lastVehicle = vehicle;
    } catch (err) {
        console.log(`${player.name} tried spawning an invalid vehicle.`);
        player.kick();
    }
}
