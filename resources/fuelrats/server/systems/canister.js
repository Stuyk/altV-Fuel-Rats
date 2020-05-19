import * as alt from 'alt';
import { distance } from '../utility/vector';
import { generateHash } from '../utility/encryption';

export class Canister {
    constructor(pos) {
        this.pos = pos;
        this.player = null;
        this.hash = generateHash(`${Math.random() * 50}`);
        this.resetCanister(pos);
    }

    resetCanister(position) {
        this.pos = position;

        if (!this.interval) {
            this.interval = alt.setInterval(this.syncCanister.bind(this), 25);
        }

        alt.emit('chat:SendAll', `A canister has been reset.`);
    }

    pickupCanister(player) {
        if (player.canister) {
            return;
        }

        player.canister = this;
        this.player = player;
        alt.emit('chat:SendAll', `${player.name} has picked up a canister.`);
    }

    dropCanister() {
        if (this.player && this.player.valid) {
            this.player.canister = null;
        }

        this.player = null;
        alt.emit('chat:SendAll', `A canister has been dropped.`);
    }

    syncCanister() {
        if (alt.Player.all.length <= 0) {
            return;
        }

        if (this.player && this.player.valid) {
            this.pos = this.player.pos;
        }

        if (this.player && !this.player.valid) {
            this.dropCanister();
        }

        const players = [...alt.Player.all].filter(player => {
            if (player.data) {
                return player;
            }
        });

        if (players.length <= 0) {
            return;
        }

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (!player || !player.valid || !player.vehicle) {
                continue;
            }

            if (!this.player) {
                const dist = distance(this.pos, player.vehicle.pos);
                if (dist <= 2) {
                    this.pickupCanister(player);
                }
            }

            player.emit('canister:Sync', this);
        }
    }
}
