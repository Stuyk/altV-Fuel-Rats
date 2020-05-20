import * as alt from 'alt';
import * as native from 'natives';
import { drawText2d, drawText3d } from '../utility/textdraws';
import {
    getClosestVectorFromGroup,
    distance,
    getClosestVehicle,
    distance2d,
    getForwardVectorServer
} from '../../shared/vector';

alt.onServer('login', toggleTick);
alt.onServer('player:RemoveBlip', removeBlip);

const playerBlips = [];
const disabledControls = [37, 24, 25, 65, 66, 67, 68, 69, 70, 75, 91, 92, 58];
let nextHideAllPlayers = Date.now() + 25;
let nextProfileCheck = Date.now() + 2500;
let nextRaycast = Date.now() + 100;
let nextPlayerBlipCheck = Date.now() + 2000;
let endVector;
let fwdVector;
let lastRay;

function toggleTick() {
    alt.Player.local.isUsingMetric = native.getProfileSetting(227);
    alt.setInterval(tick, 0);
}

function tick() {
    if (!alt.Player.local.vehicle) {
        return;
    }

    // Untimed
    disableControls();
    modifySpeed();
    drawNames();

    // Timed
    hideAllPlayers();
    profileCheck();
    collisionCheck();

    if (endVector) {
        //const pos = { ...alt.Player.local.vehicle.pos };
        //native.drawLine(pos.x, pos.y, pos.z, endVector.x, endVector.y, endVector.z, 255, 0, 0, 255);
    }
}

function disableControls() {
    for (let i = 0; i < disabledControls.length; i++) {
        native.disableControlAction(0, disabledControls[i], true);
    }
}

function hideAllPlayers() {
    if (Date.now() < nextHideAllPlayers) {
        return;
    }

    nextHideAllPlayers = Date.now() + 100;
    const players = [...alt.Player.all];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        native.setEntityInvincible(player.scriptID, true);
        native.setEntityAlpha(player.scriptID, 0);
    }
}

function profileCheck() {
    if (Date.now() < nextProfileCheck) {
        return;
    }

    nextProfileCheck = Date.now() + 5000;
    alt.Player.local.isUsingMetric = native.getProfileSetting(227);
    alt.emitServer('vehicle:Check');
}

function modifySpeed() {
    const speed = native.getEntitySpeed(alt.Player.local.vehicle.scriptID);
    const newSpeed = `${(speed * (alt.Player.local.isUsingMetric ? 3.6 : 2.236936)).toFixed(0)}`;
    const text = `${newSpeed} ${alt.Player.local.isUsingMetric ? 'km/h' : 'mp/h'}`;
    drawText2d(text, { x: 0.5, y: 0.95 }, 0.3, 255, 255, 255, 255);

    const hasCanister = alt.Player.local.getSyncedMeta('hasCanister');

    if (hasCanister) {
        native.setEntityMaxSpeed(alt.Player.local.vehicle.scriptID, 40);
    } else {
        native.setEntityMaxSpeed(alt.Player.local.vehicle.scriptID, 45);
    }
}

function drawNames() {
    alt.Player.all.forEach(player => {
        if (player === alt.Player.local) {
            return;
        }

        const currentVehPos = player.getSyncedMeta('pos');
        if (!currentVehPos) {
            return;
        }

        if (!player.blip) {
            player.blip = new alt.PointBlip(currentVehPos.x, currentVehPos.y, currentVehPos.z);
            player.blip.sprite = 225;
            player.blip.color = 5;
            player.blip.shortRange = false;
            player.blip.owner = player;
            player.blip.scale = 0.5;
        }

        const dist = distance2d(currentVehPos, alt.Player.local.pos);
        if (dist <= 100 && player.vehicle) {
            player.blip.pos = player.vehicle.pos;
        } else {
            player.blip.pos = currentVehPos;
        }

        if (dist >= 35) {
            return;
        }

        let fontSize = 0.4 - dist * 0.01;
        if (fontSize > 0.5) {
            fontSize = 0.5;
        }

        const pos = !player.vehicle ? { ...currentVehPos } : { ...player.vehicle.pos };
        pos.z += 2;

        let name = player.getSyncedMeta('name');
        if (!name) {
            name = 'Syncing...';
        }

        if (player.blip && name) {
            player.blip.name = name;
        }

        const hasCanister = player.getSyncedMeta('hasCanister');
        const rgb = !hasCanister ? { r: 255, g: 255, b: 255 } : { r: 190, g: 110, b: 255 };
        drawText3d(`(${player.id}) ${name}`, pos, fontSize, rgb.r, rgb.g, rgb.b, 150);
    });
}

function collisionCheck() {
    /*
    if (Date.now() < nextRaycast) {
        return;
    }

    nextRaycast = Date.now() + 10;
    */

    if (!alt.Player.local.vehicle.dimensions) {
        return;
    }

    // fwdVector = native.getEntityForwardVector(alt.Player.local.scriptID);
    fwdVector = native.getEntityForwardVector(alt.Player.local.vehicle.scriptID);
    const dimensions = alt.Player.local.vehicle.dimensions;
    const endVec = {
        x: alt.Player.local.vehicle.pos.x + fwdVector.x * (dimensions.totalLength / 2 + 0.45),
        y: alt.Player.local.vehicle.pos.y + fwdVector.y * (dimensions.totalLength / 2 + 0.45),
        z: alt.Player.local.vehicle.pos.z
    };

    const startVec = {
        x: alt.Player.local.vehicle.pos.x - fwdVector.x * (dimensions.totalLength / 2 + 0.45),
        y: alt.Player.local.vehicle.pos.y - fwdVector.y * (dimensions.totalLength / 2 + 0.45),
        z: alt.Player.local.vehicle.pos.z
    };

    lastRay = native.startShapeTestCapsule(
        startVec.x,
        startVec.y,
        startVec.z,
        endVec.x,
        endVec.y,
        endVec.z,
        1,
        2,
        alt.Player.local.vehicle.scriptID,
        0
    );

    let [_a, _hit, _endCoords, _surfaceNormal, _entity] = native.getShapeTestResult(lastRay);
    endVector = endVec;

    if (!_hit) {
        return;
    }

    const closestVehicle = [...alt.Vehicle.all].find(vehicle => {
        if (vehicle.scriptID === _entity) {
            return vehicle;
        }
    });

    if (!closestVehicle) {
        return;
    }

    if (!native.hasEntityCollidedWithAnything(alt.Player.local.vehicle.scriptID)) {
        return;
    }

    alt.emitServer('vehicle:Collide', closestVehicle);
}

function removeBlip(player) {
    if (!player.blip) {
        return;
    }

    if (player.blip && player.blip.valid) {
        player.blip.destroy();
    }
}
