import * as alt from 'alt';
import * as native from 'natives';
import { drawMarker } from '../utility/marker';
import { distance2d } from '../../shared/vector';
import { drawText2d, drawText3d } from '../utility/textdraws';

alt.onServer('canister:Update', canisterUpdate);

const emptyVector = { x: 0, y: 0, z: 0 };
const canisters = [];
const jerryCanHash = native.getHashKey('prop_jerrycan_01a');

native.requestModel(jerryCanHash);

function canisterUpdate(canisterData) {
    let i = canisters.findIndex(canister => canister.hash === canisterData.hash);

    if (i <= -1) {
        canisters.push(canisterData);
        i = canisters.length - 1;
    }

    canisters[i].player = canisterData.player;
    canisters[i].pos = canisterData.pos;

    if (!canisters[i].blip) {
        canisters[i].blip = new alt.PointBlip(canisters[i].pos.x, canisters[i].pos.y, canisters[i].pos.z);
        canisters[i].blip.sprite = 361;
        canisters[i].blip.shortRange = false;
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
        if (canisters[i].player && canisters[i].player.valid) {
            native.freezeEntityPosition(canisters[i].object, false);
            native.setEntityCollision(canisters[i].object, false, false);
            native.attachEntityToEntity(
                canisters[i].object,
                canisters[i].player.vehicle.scriptID,
                0,
                0,
                0,
                1,
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

        const pos = canister.player === null ? { ...canister.pos } : { ...canister.player.getSyncedMeta('pos') };
        const dist = distance2d(pos, alt.Player.local.pos);

        if (!pos.x || !pos.y || !pos.z) {
            continue;
        }

        canister.blip.pos = pos;

        if (dist <= 100 && !canister.player) {
            let fontSize = 0.4 - dist * 0.01;

            if (fontSize > 0.5) {
                fontSize = 0.5;
            }

            drawText3d(`Fuel Canister`, pos, fontSize, 255, 0, 0, 255);
        }

        if (canister.player && canister.player.vehicle && dist <= 50) {
            if (!native.isEntityAttachedToEntity(canister.object, canister.player.vehicle.scriptID)) {
                const modelInfo = native.getEntityModel(canister.player.vehicle.scriptID);
                const [_, min, max] = native.getModelDimensions(modelInfo);

                native.attachEntityToEntity(
                    canister.object,
                    canister.player.vehicle.scriptID,
                    0,
                    0,
                    0,
                    max.z - min.z, // zOffset
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
            native.setEntityCoordsNoOffset(
                canister.object,
                canister.pos.x,
                canister.pos.y,
                canister.pos.z + 1,
                false,
                false,
                false
            );
        }
    }
});
