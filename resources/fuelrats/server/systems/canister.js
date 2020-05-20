import * as alt from 'alt';
import { generateHash } from '../utility/encryption';
import { DEFAULT_CONFIG } from '../configuration/config';
import { distance2d } from '../../shared/vector';

export class Canister {
    constructor(pos) {
        this.data = {
            pos,
            player: null,
            hash: generateHash(`${Math.random() * 50}`),
            goal: DEFAULT_CONFIG.SCRUM_GOALS[Math.floor(Math.random() * DEFAULT_CONFIG.SCRUM_GOALS.length)]
        };

        this.pickupCooldown = Date.now() + 2500;
        alt.on('sync:Player', this.updatePlayer.bind(this));
        alt.setInterval(this.tick.bind(this), 10);
        this.reset(this.data.pos);
    }

    reset(position, reset = false) {
        if (this.data.player && this.data.player.valid) {
            position = this.data.player.pos;
            this.data.player.canister = null;
        }

        if (reset) {
            position = DEFAULT_CONFIG.SCRUM_SPAWNS[Math.floor(Math.random() * DEFAULT_CONFIG.SCRUM_SPAWNS.length)];
        }

        this.data.goal = DEFAULT_CONFIG.SCRUM_GOALS[Math.floor(Math.random() * DEFAULT_CONFIG.SCRUM_GOALS.length)];
        this.data.player = null;
        this.data.pos = position;

        this.updatePlayer(null);
        this.notifyPlayer(null, `A canister has been reset.`);
        this.resetting = false;
    }

    pickup(player) {
        if (Date.now() < this.pickupCooldown) {
            return;
        }

        this.pickupCooldown = Date.now() + 2000;

        if (player.canister) {
            this.notifyPlayer(player, `{FF0000} You have already picked up a canister.`);
            return;
        }

        if (this.data.player) {
            this.notifyPlayer(
                null,
                `${player.data.username} has stolen a canister from ${this.data.player.data.username}!`
            );
            this.data.player.canister = null;
            this.data.player.setSyncedMeta('hasCanister', false);
        } else {
            this.notifyPlayer(null, `${player.data.username} has picked up a canister.`);
        }

        player.canister = this;
        this.data.player = player;

        player.setSyncedMeta('hasCanister', true);
        this.updatePlayer(null);
    }

    drop(position) {
        if (this.data.player && this.data.player.pos) {
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
        if (this.resetting) {
            return;
        }

        if (this.data.player && this.data.player.valid) {
            if (distance2d(this.data.player.pos, this.data.goal) <= 5) {
                this.resetting = true;
                if (!this.data.player.score) {
                    this.data.player.score = 1;
                } else {
                    this.data.player.score += 1;
                }

                this.notifyPlayer(
                    null,
                    `${this.data.player.data.username} has scored! Total score: ${this.data.player.score}`
                );
                this.reset(null, true);
            }

            return;
        }

        if (!this.data.pos) {
            return;
        }

        const players = alt.Player.all.filter(player => {
            if (player && player.valid && player.data && player.pos && player.dimension === 0 && player.vehicle) {
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
