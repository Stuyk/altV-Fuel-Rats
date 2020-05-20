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

    // TODO: RANDOM SPAWN CODE FOR VEHICLES

    try {
        const vehicle = new alt.Vehicle(model, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
        player.setIntoVehicle(vehicle);
        player.lastVehicle = vehicle;
        player.vehicleModel = model;
        vehicle.player = player;
    } catch (err) {
        console.log(`${player.name} tried spawning an invalid vehicle.`);
        player.kick();
    }
}

function collideVehicle(player, vehicle) {
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
}
