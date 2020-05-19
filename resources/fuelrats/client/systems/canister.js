import * as alt from 'alt';
import * as native from 'natives';
import { drawMarker } from '../utility/marker';

alt.onServer('canister:Sync', canisterSync);

const emptyVector = { x: 0, y: 0, z: 0 };
const canisters = [];

/**
 *
 * @param {*} canisterData
 */
function canisterSync(canisterData) {
    const index = canisters.findIndex(canister => canister.hash === canisterData.hash);

    if (index <= -1) {
        alt.log(`Created Canister`);
        canisterData.blip = new alt.PointBlip(canisterData.pos.x, canisterData.pos.y, canisterData.pos.z);
        canisterData.blip.sprite = 361;
        canisterData.blip.shortRange = false;
        canisters.push(canisterData);
    } else {
        const canister = canisters[index];
        canister.blip.pos = canisterData.pos;
    }
}

alt.everyTick(() => {
    if (canisters.length <= 0) {
        return;
    }

    canisters.forEach(canister => {
        if (canister.player) {
            return;
        }

        drawMarker(1, canister.pos, emptyVector, emptyVector, { x: 0.2, y: 0.2, z: 100 }, 0, 255, 0, 255);
    });
});
