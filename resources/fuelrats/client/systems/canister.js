import * as alt from 'alt';
import * as native from 'natives';
import { drawMarker } from '../utility/marker';
import { distance2d } from '../../shared/vector';
import { drawText2d, drawText3d } from '../utility/textdraws';

alt.onServer('canister:Update', canisterUpdate);

const emptyVector = { x: 0, y: 0, z: 0 };
const canisters = [];
const jerryCanHash = native.getHashKey('prop_jerrycan_01a');
const spawn = {
    x: 1207.3187255859375,
    y: 3078.633056640625,
    z: 40.6871337890625
};
const spawnBlip = new alt.PointBlip(spawn.x, spawn.y, spawn.z);
spawnBlip.sprite = 40;
spawnBlip.color = 83;
spawnBlip.shortRange = false;
spawnBlip.name = 'Spawn';

native.requestModel(jerryCanHash);

function canisterUpdate(canisterData) {
    let i = canisters.findIndex(canister => canister.hash === canisterData.hash);

    if (i <= -1) {
        canisters.push(canisterData);
        i = canisters.length - 1;
    }

    canisters[i].player = canisterData.player;
    canisters[i].pos = canisterData.pos;
    canisters[i].goal = canisterData.goal;

    if (!canisters[i].blip && canisters[i].pos) {
        canisters[i].blip = new alt.PointBlip(canisters[i].pos.x, canisters[i].pos.y, canisters[i].pos.z);
        canisters[i].blip.sprite = 361;
        canisters[i].blip.shortRange = false;
        canisters[i].blip.color = 1;
        canisters[i].blip.name = 'Canister';
        canisters[i].blip.priority = 99;
    }

    if (!canisters[i].goalBlip && canisters[i].goal) {
        canisters[i].goalBlip = new alt.PointBlip(canisters[i].pos.x, canisters[i].pos.y, canisters[i].pos.z);
        canisters[i].goalBlip.sprite = 38;
        canisters[i].goalBlip.shortRange = false;
        canisters[i].blip.name = 'Goal';
    }

    if (!canisters[i].pos && canisters[i].blip) {
        canisters[i].blip.destroy();
        canisters[i].blip = null;
    }

    if (!canisters[i].goal && canisters[i].goalBlip) {
        canisters[i].goalBlip.destroy();
        canisters[i].goalBlip = null;
    }

    if (canisters[i].object && !canisters[i].pos) {
        native.deleteObject(canisters[i].object);
        canisters[i].object = null;
    }

    if (!canisters[i].pos) {
        return;
    }

    canisters[i].blip.pos = canisterData.pos;

    if (!canisters[i].object) {
        canisters[i].object = native.createObjectNoOffset(
            jerryCanHash,
            canisters[i].pos.x,
            canisters[i].pos.y,
            canisters[i].pos.z,
            false,
            false,
            false
        );
        native.freezeEntityPosition(canisters[i].object, true);
        native.setEntityCollision(canisters[i].object, false, false);
    } else {
        if (canisters[i].player && canisters[i].player.valid && canisters[i].player.vehicle) {
            const modelInfo = native.getEntityModel(canisters[i].player.vehicle.scriptID);
            const [_, min, max] = native.getModelDimensions(modelInfo);
            const quickMaffs = Math.abs(min.z) + Math.abs(max.z) + 0.02;

            native.freezeEntityPosition(canisters[i].object, false);
            native.setEntityCollision(canisters[i].object, false, false);
            native.attachEntityToEntity(
                canisters[i].object,
                canisters[i].player.vehicle.scriptID,
                0,
                0,
                0,
                quickMaffs,
                0,
                0,
                0,
                false,
                false,
                false,
                false,
                0,
                true
            );
        } else {
            native.detachEntity(canisters[i].object, false, false);
            native.setEntityCoordsNoOffset(
                canisters[i].object,
                canisters[i].pos.x,
                canisters[i].pos.y,
                canisters[i].pos.z + 1,
                false,
                false,
                false
            );
        }
    }
}

alt.everyTick(() => {
    if (canisters.length <= 0) {
        return;
    }

    for (let i = 0; i < canisters.length; i++) {
        const canister = canisters[i];

        if (!canister) {
            continue;
        }

        if (!canister.pos) {
            continue;
        }

        if (!canister.goal) {
            continue;
        }

        const pos = canister.player === null ? { ...canister.pos } : { ...canister.player.getSyncedMeta('pos') };
        const dist = distance2d(pos, alt.Player.local.pos);

        if (!pos.x || !pos.y || !pos.z) {
            continue;
        }

        canister.blip.pos = pos;
        canister.goalBlip.pos = canister.goal;

        if (dist <= 100 && !canister.player) {
            let fontSize = 0.4 - dist * 0.01;

            if (fontSize > 0.5) {
                fontSize = 0.5;
            }

            const modifiedPos = { ...pos };
            modifiedPos.z += 1.5;
            drawText3d(`Fuel Canister`, modifiedPos, fontSize, 255, 255, 255, 255);
        }

        const goalDist = distance2d(alt.Player.local.pos, canister.goal);
        if (goalDist <= 400 && canister.goal) {
            drawMarker(1, canister.goal, emptyVector, emptyVector, { x: 3, y: 3, z: 50 }, 255, 0, 0, 50);
        }

        if (dist <= 100 && dist >= 50 && canister.player && canister.player.vehicle) {
            drawMarker(
                0,
                canister.player.vehicle.pos,
                emptyVector,
                emptyVector,
                { x: 0.2, y: 0.2, z: 10 },
                255,
                0,
                0,
                100
            );
        }

        if (canister.player && canister.player.vehicle && dist <= 50) {
            if (!native.isEntityAttachedToEntity(canister.object, canister.player.vehicle.scriptID)) {
                const modelInfo = native.getEntityModel(canister.player.vehicle.scriptID);
                const [_, min, max] = native.getModelDimensions(modelInfo);
                const quickMaffs = Math.abs(min.z) + Math.abs(max.z) + 1;
                native.attachEntityToEntity(
                    canister.object,
                    canister.player.vehicle.scriptID,
                    0,
                    0,
                    0,
                    quickMaffs, // zOffset
                    0,
                    0,
                    0,
                    false,
                    false,
                    false,
                    false,
                    0,
                    true
                );
            }
        }

        if (!canister.player && dist <= 50) {
            native.detachEntity(canister.object, false, false);
            native.setEntityCollision(canister.object, false, false);
            native.setEntityCoordsNoOffset(
                canister.object,
                canister.pos.x,
                canister.pos.y,
                canister.pos.z,
                false,
                false,
                false
            );
        }
    }
});
