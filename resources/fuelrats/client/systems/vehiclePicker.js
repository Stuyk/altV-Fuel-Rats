import * as alt from 'alt';
import * as native from 'natives';

let vehicles;
let interval;
let vehicle;
let startPosition;

const keyBinds = {
    '13': selectVehicle, // Enter
    '65': previousVehicle, // A
    '68': nextVehicle // D
};

alt.onServer('vehicle:Pick', toggleVehiclePicker);

async function toggleVehiclePicker(validVehicles) {
    native.doScreenFadeOut(0);

    if (!vehicles) {
        vehicles = validVehicles;

        for (let i = 0; i < vehicles.length; i++) {
            const hash = alt.hash(vehicles[i]);
            native.requestModel(hash);

            await new Promise(resolve => {
                const interval = alt.setInterval(() => {
                    if (!native.hasModelLoaded(hash)) {
                        return;
                    }

                    alt.log(`Loaded: ${vehicles[i]}`);
                    alt.clearInterval(interval);
                    resolve();
                }, 100);
            });
        }
    }

    native.doScreenFadeIn(200);

    if (interval) {
        alt.clearInterval(interval);
        interval = null;
    }

    startPosition = { ...alt.Player.local.pos };

    alt.on('keyup', keyHandler);
    synchronizeVehicle();
}

function keyHandler(key) {
    if (alt.Player.local.chatActive) {
        return;
    }

    if (!keyBinds[`${key}`]) {
        return;
    }

    keyBinds[`${key}`]();
}

function previousVehicle() {
    const endElement = vehicles.pop();
    vehicles.unshift(endElement);
    synchronizeVehicle();
}

function nextVehicle() {
    const firstElement = vehicles.shift();
    vehicles.push(firstElement);
    synchronizeVehicle();
}

function selectVehicle() {
    alt.off('keyup', keyHandler);
    native.taskLeaveVehicle(alt.Player.local.scriptID, vehicle, 16);
    native.doScreenFadeOut(0);

    if (vehicle) {
        native.deleteEntity(vehicle);
        vehicle = null;
    }

    alt.emitServer('vehicle:Select', vehicles[0]);
    native.doScreenFadeIn(500);
}

function synchronizeVehicle() {
    if (vehicle) {
        native.deleteEntity(vehicle);
        vehicle = null;
    }

    alt.log(vehicles[0]);

    const hash = native.getHashKey(vehicles[0]);
    vehicle = native.createVehicle(hash, startPosition.x, startPosition.y, startPosition.z, 0, false, false, false);

    native.freezeEntityPosition(vehicle, true);

    alt.setTimeout(() => {
        native.setPedIntoVehicle(alt.Player.local.scriptID, vehicle, -1);
    }, 50);
}
