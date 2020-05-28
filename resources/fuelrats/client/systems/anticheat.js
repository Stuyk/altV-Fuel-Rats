import * as alt from 'alt';
import * as native from 'natives';
import { distance2d } from '../../shared/vector';

const timeBetweenChecks = 2000;
let nextStandardCheck = Date.now() + 5000;

alt.setInterval(() => {
    if (Date.now() > nextStandardCheck) {
        nextStandardCheck = Date.now() + timeBetweenChecks;
        handleCoordChanges();
    }
}, 0);

function handleCoordChanges() {
    if (!alt.Player.local.getSyncedMeta('ready')) {
        return;
    }

    if (!alt.Player.local.vehicle) {
        alt.emitServer('anticheat:Teleport');
        return;
    }

    if (!alt.Player.local.lastPos) {
        alt.Player.local.lastPos = alt.Player.local.pos;
    }

    const currentSpeed = native.getEntitySpeed(alt.Player.local.vehicle.scriptID);
    const dist = distance2d(alt.Player.local.lastPos, alt.Player.local.pos);
    const distanceNum = 100;

    if (dist > distanceNum) {
        alt.Player.local.lastPos = alt.Player.local.pos;
        alt.emitServer('anticheat:Teleport', `${dist}`);
        return;
    }

    if (alt.Player.local.vehicle && currentSpeed > 50) {
        alt.emitServer('anticheat:SpeedHack', currentSpeed);
        return;
    }

    alt.Player.local.lastPos = alt.Player.local.pos;
}
