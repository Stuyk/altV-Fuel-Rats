import * as alt from 'alt';
import { registerCmd } from '../systems/chat';
import { trySpawningVehicle } from '../systems/vehicles';
import { spawnPlayer } from '../systems/spawn';

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

    trySpawningVehicle(player, model);
}

registerCmd('car', '/car | Swap Vehicle', swapCar);
registerCmd('swapcar', '/swapcar | Swap Vehicle', swapCar);
registerCmd('spawncar', '/spawncar | Swap Vehicle', swapCar);
registerCmd('changevehicle', '/changevehicle | Swap Vehicle', swapCar);
registerCmd('vehicle', '/vehicle | Swap Vehicle', swapCar);

function swapCar(player) {
    if (player.canister) {
        player.send(`{BE6EFF}[INFO]{FFFFFF} You cannot do that while you have a canister.`);
        return;
    }

    if (player.lastVehicle && player.lastVehicle.valid) {
        player.lastVehicle.destroy();
        player.lastVehicle = null;
    }

    spawnPlayer(player);
}
