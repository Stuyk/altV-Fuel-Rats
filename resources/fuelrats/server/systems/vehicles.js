import * as alt from 'alt';
import { DEFAULT_CONFIG } from '../configuration/config';

alt.onClient('vehicle:Select', selectVehicle);
alt.onClient('vehicle:Collide', collideVehicle);
alt.onClient('vehicle:Check', vehicleCheck);

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

    trySpawningVehicle(player, model);
}

export function trySpawningVehicle(player, model) {
    try {
        const vehicle = new alt.Vehicle(model, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        player.setIntoVehicle(vehicle);
        player.lastVehicle = vehicle;
        player.vehicleModel = model;
        vehicle.player = player;
        vehicle.customPrimaryColor = { r: 255, g: 255, b: 255, a: 255 };
        vehicle.customSecondaryColor = { r: 255, g: 255, b: 255, a: 255 };
    } catch (err) {
        const vehicle = new alt.Vehicle(CONFIG.VALID_VEHICLES[0], player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        player.setIntoVehicle(vehicle);
        player.lastVehicle = vehicle;
        player.vehicleModel = model;
        vehicle.player = player;
        player.send(`Something went wrong so we defaulted your vehicle.`);
        vehicle.customPrimaryColor = { r: 255, g: 255, b: 255, a: 255 };
        vehicle.customSecondaryColor = { r: 255, g: 255, b: 255, a: 255 };
    }

    player.setSyncedMeta('ready', true);
}

function collideVehicle(player, vehicle) {
    if (!vehicle) {
        return;
    }

    if (vehicle.debug) {
        player.send(`You collided!`);
        player.send(`---`);
        return;
    }

    if (!vehicle.player) {
        return;
    }

    if (vehicle.player === player) {
        return;
    }

    if (player.valid && player.vehicle) {
        player.vehicle.engineHealth = 999;
        player.emit('vehicle:Repair');
    }

    if (vehicle.player && vehicle.player.valid) {
        vehicle.engineHealth = 999;
        vehicle.player.emit('vehicle:Repair');
    }

    if (player.canister) {
        player.canister.pickup(vehicle.player);
    }

    if (vehicle.player.canister) {
        vehicle.player.canister.pickup(player);
    }
}

function vehicleCheck(player) {
    if (!player.vehicle) {
        return;
    }

    if (!player.valid) {
        return;
    }

    if (player.lastVehicle.engineHealth <= 600) {
        const model = player.vehicleModel;

        if (player.lastVehicle && player.lastVehicle.valid) {
            player.lastVehicle.destroy();
            player.lastVehicle = null;
        }

        trySpawningVehicle(player, model);
    }
}
