import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('anticheat:Heartbeat', (eventName, e) => {
    alt.emitServer(eventName, eventName, native.getEntitySpeed(alt.Player.local.vehicle.scriptID));
});
