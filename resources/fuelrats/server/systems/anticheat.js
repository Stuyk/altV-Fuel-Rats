import * as alt from 'alt';
import { generateHash } from '../utility/encryption';
import { distance2d } from '../../shared/vector';

const maxTeleportDistance = 96;
let paused = false;

alt.on('anticheat:Pause', handlePause);

function handlePause(value) {
    paused = value;
}

alt.setInterval(() => {
    if (paused) {
        return;
    }

    const players = [...alt.Player.all];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (!player || !player.valid || player.getSyncedMeta('pause')) {
            continue;
        }

        const eventHash = generateHash(player.name);
        alt.onClient(eventHash, handleSpeedCheck);
        player.isCheatChecking = alt.setTimeout(() => {
            if (paused) {
                return;
            }

            if (!player || !player.valid) {
                return;
            }

            const name = player.getSyncedMeta('player');
            if (!name) {
                return;
            }

            alt.emit('chat:SendAll', `(${player.id}) was kicked for not sending a heartbeat to the server.`);
            player.kick();
        }, 1900);

        alt.emitClient(player, 'anticheat:Heartbeat', eventHash);
    }
}, 2000);

function handleSpeedCheck(player, eventHash, currentSpeed) {
    alt.offClient(eventHash, handleSpeedCheck);

    if (!player || !player.valid || player.getSyncedMeta('pause')) {
        try {
            alt.clearTimeout(player.isCheatChecking);
            player.isCheatChecking = null;
        } catch (err) {
            player.isCheatChecking = null;
        }
        return;
    }

    if (currentSpeed === undefined || currentSpeed === null) {
        if (player.vehicle && player.vehicle.valid) {
            player.vehicle.destroy();
        }

        alt.clearTimeout(player.isCheatChecking);
        alt.emit('chat:SendAll', `(${player.id}) sent up invalid speed values.`);
        player.kick();
        return;
    }

    if (player.offenses >= 3) {
        if (player.vehicle && player.vehicle.valid) {
            player.vehicle.destroy();
        }

        try {
            alt.clearTimeout(player.isCheatChecking);
            player.isCheatChecking = null;
        } catch (err) {
            player.isCheatChecking = null;
        }

        alt.emit('chat:SendAll', `(${player.id}) was kicked for resetting the canister too many times.`);
        player.kick();
        return;
    }

    if (!player.vehicle) {
        if (player.vehicle && player.vehicle.valid) {
            player.vehicle.destroy();
        }

        try {
            alt.clearTimeout(player.isCheatChecking);
            player.isCheatChecking = null;
        } catch (err) {
            player.isCheatChecking = null;
        }

        alt.emit('chat:SendAll', `(${player.id}) was kicked for leaving their vehicle.`);
        player.kick();
        return;
    }

    if (currentSpeed > 50) {
        if (player.vehicle && player.vehicle.valid) {
            player.vehicle.destroy();
        }

        try {
            alt.clearTimeout(player.isCheatChecking);
            player.isCheatChecking = null;
        } catch (err) {
            player.isCheatChecking = null;
        }

        alt.emit('chat:SendAll', `(${player.id}) was kicked for speed hacking.`);
        player.kick();
        return;
    }

    if (!player.lastPosition) {
        player.lastPosition = { ...player.pos };
    }

    if (!player.lastZPos) {
        player.lastZPos = player.pos.z;
    }

    const dist = distance2d(player.pos, player.lastPosition);
    if (dist >= maxTeleportDistance) {
        if (player.vehicle && player.vehicle.valid) {
            player.vehicle.destroy();
        }

        try {
            alt.clearTimeout(player.isCheatChecking);
            player.isCheatChecking = null;
        } catch (err) {
            player.isCheatChecking = null;
        }

        alt.emit('chat:SendAll', `(${player.id}) was kicked for teleporting.`);
        player.kick();
        return;
    }

    if (player.pos.z - player.lastZPos > 45) {
        if (player.vehicle && player.vehicle.valid) {
            player.vehicle.destroy();
        }

        try {
            alt.clearTimeout(player.isCheatChecking);
            player.isCheatChecking = null;
        } catch (err) {
            player.isCheatChecking = null;
        }

        alt.emit('chat:SendAll', `(${player.id}) was kicked for super jump.`);
        player.kick();
        return;
    }

    try {
        alt.clearTimeout(player.isCheatChecking);
        player.isCheatChecking = null;
    } catch (err) {
        player.isCheatChecking = null;
    }

    player.lastPosition = { ...player.pos };
    player.lastZPos = player.pos.z;
}
