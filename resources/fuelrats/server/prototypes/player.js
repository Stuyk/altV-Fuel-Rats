import * as alt from 'alt';

alt.Player.prototype.send = function send(msg) {
    alt.emitClient(this, 'chat:Send', msg);
};

alt.Player.prototype.emit = function emit(emitRoute, ...args) {
    alt.emitClient(this, emitRoute, ...args);
};

alt.Player.prototype.sync = function sync(accountData) {
    // Remove sensitive data...
    delete accountData.password;

    // Bind data...
    this.data = accountData;
    this.setSyncedMeta('name', this.data.username);

    // Setup interval to tick through...
    this.tickInterval = alt.setInterval(this.tick.bind(this), 100);

    // What to do after synchronization.
    this.emit('panel:Registration:Close');
    alt.emit('sync:Player', this);
};

alt.Player.prototype.tick = function tick() {
    if (!this.valid) {
        return;
    }

    this.setSyncedMeta('pos', this.pos);
};

alt.Player.prototype.setIntoVehicle = function setIntoVehicle(vehicle) {
    if (!vehicle.valid) {
        return;
    }

    this.emit('vehicle:SetInto', vehicle);
};
