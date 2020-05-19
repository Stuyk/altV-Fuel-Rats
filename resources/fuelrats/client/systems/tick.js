import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('login', toggleTick);

const disabledControls = [37, 24, 25, 65, 66, 67, 68, 69, 70, 75, 91, 92, 58];

function toggleTick() {
    alt.setInterval(tick, 0);
}

function tick() {
    for (let i = 0; i < disabledControls.length; i++) {
        native.disableControlAction(0, disabledControls[i], true);
    }
}
