import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('vehicle:SetInto', setIntoVehicle);
alt.onServer('vehicle:Repair', repairVehicle);

function setIntoVehicle(vehicle) {
    const interval = alt.setInterval(() => {
        if (!alt.Player.local.vehicle) {
            native.setPedIntoVehicle(alt.Player.local.scriptID, vehicle.scriptID, -1);
        } else {
            native.setPedConfigFlag(alt.Player.local.scriptID, 32, false);
            native.setPedConfigFlag(alt.Player.local.scriptID, 429, 1);
            native.setPedConfigFlag(alt.Player.local.scriptID, 184, 1);
            native.setPedConfigFlag(alt.Player.local.scriptID, 35, 0);
            native.pauseClock(true);

            const modelInfo = native.getEntityModel(alt.Player.local.vehicle.scriptID);
            const [_, min, max] = native.getModelDimensions(modelInfo);
            const dimensions = { min, max, totalLength: 0 };
            const absX = Math.abs(min.x) + Math.abs(max.x);
            const absY = Math.abs(min.y) + Math.abs(max.y);

            if (absX > absY) {
                dimensions.totalLength = absX;
            } else {
                dimensions.totalLength = absY;
            }

            native.setPedComponentVariation(alt.Player.local.scriptID, 4, 34, 0, 2);
            native.setPedComponentVariation(alt.Player.local.scriptID, 6, 25, 0, 2);
            native.setPedComponentVariation(alt.Player.local.scriptID, 8, 15, 0, 2);
            native.setPedComponentVariation(alt.Player.local.scriptID, 11, 243, 0, 2);
            native.setPedComponentVariation(alt.Player.local.scriptID, 15, 96, 0, 2);
            native.setPedPropIndex(alt.Player.local.scriptID, 0, 18, 0, true);

            alt.Player.local.vehicle.dimensions = dimensions;
            alt.clearInterval(interval);
        }
    }, 100);
}

function repairVehicle() {
    native.setVehicleFixed(alt.Player.local.vehicle.scriptID);
}
