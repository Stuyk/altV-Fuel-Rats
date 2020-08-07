import * as alt from 'alt';
import { registerCmd } from '../systems/chat';
import { trySpawningVehicle } from '../systems/vehicles';
import { spawnPlayer } from '../systems/spawn';

const lastVotes = {};

registerCmd('votekick', '/votekick [id]', handleKick);
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

    player.ready = false;
    if (player.isCheatChecking !== undefined) {
        alt.clearTimeout(player.isCheatChecking);
    }

    player.lastPosition = null;
    player.lastZPos = null;

    if (player.lastVehicle && player.lastVehicle.valid) {
        player.lastVehicle.destroy();
        player.lastVehicle = null;
    }

    spawnPlayer(player);
}

registerCmd('test', '/test', player => {
    player.pos = { x: 1719.3363037109375, y: 3269.841796875, z: 40.93994140625 };
});

function handleKick(player, args) {
    if (lastVotes[player.ip] && Date.now() < lastVotes[player.ip]) {
        player.send(`You cannot call a vote that early.`);
        return;
    }

    const id = args[0];
    if (isNaN(id)) {
        player.send(`/votekick [id]`);
        return;
    }

    if (alt.Player.all.length <= 4) {
        player.send(`/votekick is not enabled at this time.`);
        return;
    }

    const target = alt.Player.all.find(p => p.id === parseInt(id));
    if (!target) {
        player.send(`That ID does not exist.`);
        return;
    }

    if (target === player) {
        player.send(`You can't kick yourself.`);
        return;
    }

    if (!player.votedFor) {
        player.votedFor = [target.ip];
    } else {
        if (player.votedFor.includes(target.ip)) {
            player.send(`Stop trying to vote twice asshole.`);
            return;
        }

        player.votedFor.push(target.ip);
    }

    if (!target.votes) {
        target.votes = 1;
        lastVotes[player.ip] = Date.now() + 60000 * 5;
    } else {
        target.votes += 1;
    }

    const name = target.getSyncedMeta('name');
    player.send(`You voted to kick ${name} (${target.id})`);

    if (target.votes && target.votes / alt.Player.all.length >= 0.5) {
        if (target.vehicle && target.vehicle.destroy) {
            target.vehicle.destroy();
        }

        alt.emit('chat:SendAll', `(${target.id}) was kicked from the server.`);
        alt.emit('kicked:AddIP', target.ip);
        target.kick();
        return;
    }
}
