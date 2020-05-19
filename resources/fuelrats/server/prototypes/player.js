import * as alt from 'alt';

alt.Player.prototype.send = function send(msg) {
    alt.emitClient(this, 'chat:Send', msg);
};

alt.Player.prototype.emit = function emit(emitRoute, ...args) {
    alt.emitClient(this, emitRoute, ...args);
};

alt.Player.prototype.sync = function sync(accountData) {
    this.data = accountData;

    // What to do after synchronization.
    alt.emit('sync:Player', this);
};

alt.Player.prototype.setIntoVehicle = function setIntoVehicle(vehicle) {
    if (!vehicle.valid) {
        return;
    }

    this.emit('vehicle:SetInto', vehicle);
};
