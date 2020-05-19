import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('vehicle:SetInto', setIntoVehicle);

function setIntoVehicle(vehicle) {
    const interval = alt.setInterval(() => {
        if (!alt.Player.vehicle) {
            native.setPedIntoVehicle(alt.Player.local.scriptID, vehicle.scriptID, -1);
        } else {
            native.setPedConfigFlag(alt.Player.local.scriptID, 32, false);
            alt.clearInterval(interval);
        }
    }, 100);
}
