import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('anticheat:Heartbeat', eventName => {
    const currentSpeed = native.getEntitySpeed(alt.Player.local.vehicle.scriptID);
    alt.emitServer(eventName, eventName, currentSpeed);
});
