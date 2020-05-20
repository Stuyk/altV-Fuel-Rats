import * as alt from 'alt';
import { registerCmd } from '../systems/chat';

registerCmd('coords', '/coords | Returns current coordinates to chat and console.', player => {
    const coords = player.pos;
    player.send(JSON.stringify(coords));
    console.log(coords);
});

registerCmd('players', '/players | Returns current player count.', player => {
    player.send(`Player Count: ${alt.Player.all.length}`);
});

registerCmd('respawn', '/respawn | Flip your vehicle upright.', flipVehicle);
registerCmd('flip', '/flip | Flip your vehicle upright.', flipVehicle);
registerCmd('spawn', '/spawn | Flip your vehicle upright.', flipVehicle);

function flipVehicle(player) {
    const model = player.vehicleModel;
    if (player.lastVehicle && player.lastVehicle.valid) {
        player.lastVehicle.destroy();
        player.lastVehicle = null;
    }

    try {
        const vehicle = new alt.Vehicle(model, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        player.lastVehicle = vehicle;
        vehicle.player = player;
        player.setIntoVehicle(vehicle);
    } catch (err) {
        const vehicle = new alt.Vehicle(
            DEFAULT_CONFIG.VALID_VEHICLES[0],
            player.pos.x,
            player.pos.y,
            player.pos.z,
            0,
            0,
            0
        );
        player.lastVehicle = vehicle;
        vehicle.player = player;
        player.setIntoVehicle(vehicle);
    }
}
