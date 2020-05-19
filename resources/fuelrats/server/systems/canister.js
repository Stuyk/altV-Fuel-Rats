import * as alt from 'alt';
import { generateHash } from '../utility/encryption';
import { DEFAULT_CONFIG } from '../configuration/config';
import { distance2d } from '../../shared/vector';

export class Canister {
    constructor(pos) {
        this.data = {
            pos,
            player: null,
            hash: generateHash(`${Math.random() * 50}`)
        };

        alt.on('sync:Player', this.updatePlayer.bind(this));
        alt.setInterval(this.tick.bind(this), 10);
        this.reset(this.data.pos);
    }

    reset(position) {
        this.data.pos = position;
        this.data.player = null;
        this.updatePlayer(null);
        this.notifyPlayer(null, `A canister has been reset.`);
    }

    pickup(player) {
        if (player.canister) {
            this.notifyPlayer(player, `{FF0000} You have already picked up a canister.`);
            return;
        }

        if (this.data.player) {
            return;
        }

        player.canister = this;
        this.data.player = player;

        this.updatePlayer(null);
        this.notifyPlayer(null, `${player.name} has picked up a canister.`);
    }

    drop(position) {
        if (this.data.player && this.data.player.valid) {
            position = this.data.player.pos;
            this.data.player.canister = null;
        }

        this.data.pos = position;
        this.data.player = null;
        this.updatePlayer(null);
        this.notifyPlayer(null, `A canister has been dropped.`);
    }

    updatePlayer(player) {
        alt.emitClient(player, 'canister:Update', this.data);
    }

    notifyPlayer(player, message) {
        if (!player) {
            alt.emit('chat:SendAll', `[GAME] ${message}`);
            return;
        }

        player.send(`[GAME] ${message}`);
    }

    tick() {
        if (this.data.player) {
            return;
        }

        if (!this.data.pos) {
            return;
        }

        const players = alt.Player.all.filter(player => {
            if (player && player.valid && player.data) {
                return player;
            }
        });

        if (players.length <= 0) {
            return;
        }

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const dist = distance2d(player.pos, this.data.pos);
            if (dist <= 3) {
                this.pickup(player);
            }
        }
    }
}

new Canister(DEFAULT_CONFIG.SCRUM_SPAWNS[0]);
