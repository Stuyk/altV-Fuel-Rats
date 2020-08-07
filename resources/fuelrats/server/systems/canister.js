import * as alt from 'alt';
import { generateHash } from '../utility/encryption';
import { DEFAULT_CONFIG } from '../configuration/config';
import { distance2d } from '../../shared/vector';
import { trySpawningVehicle } from './vehicles';

export class Canister {
    constructor(pos) {
        this.data = {
            pos,
            player: null,
            hash: generateHash(`${Math.random() * 50}`),
            goal: DEFAULT_CONFIG.SCRUM_GOALS[Math.floor(Math.random() * DEFAULT_CONFIG.SCRUM_GOALS.length)]
        };

        this.canisterAtSpawnTicks = 0;
        this.pickupCooldown = Date.now() + 2500;
        alt.on('sync:Player', this.updatePlayer.bind(this));
        alt.setInterval(this.tick.bind(this), 10);
        this.reset(this.data.pos, true);
    }

    reset(position, reset = false) {
        if (this.resetting) {
            return;
        }

        this.resetting = true;

        if (this.data.player && this.data.player.valid) {
            position = this.data.player.pos;
            this.data.player.canister = null;
        }

        if (reset) {
            position = DEFAULT_CONFIG.SCRUM_SPAWNS[Math.floor(Math.random() * DEFAULT_CONFIG.SCRUM_SPAWNS.length)];
        }

        alt.Player.all.forEach(player => {
            player.setSyncedMeta('hasCanister', false);
        });

        this.canisterAtSpawnTicks = 0;
        this.data.player = null;
        this.data.pos = null;
        this.data.goal = null;
        this.updatePlayer(null);

        alt.emit('anticheat:Pause', true);
        const players = [...alt.Player.all];
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (!player || !player.valid || !player.vehicle) {
                continue;
            }

            if (!player.vehicle.destroy || !player.vehicle.valid) {
                continue;
            }

            player.vehicle.destroy();
            player.lastPosition = null;
            player.lastZPos = null;
            player.pos = DEFAULT_CONFIG.SPAWN;
            trySpawningVehicle(player, player.vehicleModel);
        }

        alt.setTimeout(() => {
            this.data.goal = DEFAULT_CONFIG.SCRUM_GOALS[Math.floor(Math.random() * DEFAULT_CONFIG.SCRUM_GOALS.length)];
            this.data.player = null;
            this.data.pos = position;
            this.resetting = false;
            this.updatePlayer(null);
            this.notifyPlayer(null, `Canister was spawned!`);
            this.playSound(null, 'HUD_AWARDS', 'CHALLENGE_UNLOCKED');
            alt.emit('anticheat:Pause', false);
        }, 5000);
    }

    pickup(player) {
        if (Date.now() < this.pickupCooldown) {
            return;
        }

        this.pickupCooldown = Date.now() + 1000;

        if (player.canister) {
            this.notifyPlayer(player, `{FF0000} You have already picked up a canister.`);
            return;
        }

        this.playSound(player, 'DLC_HEIST_HACKING_SNAKE_SOUNDS', 'Beep_Green');

        if (this.data.player) {
            this.playSound(this.data.player, 'DLC_HEIST_HACKING_SNAKE_SOUNDS', 'Beep_Red');
            this.notifyPlayer(
                null,
                `${player.data.username} has stolen a canister from ${this.data.player.data.username}!`
            );
            this.data.player.canister = null;
            this.data.player.setSyncedMeta('hasCanister', false);
            this.data.player.vehicle.customPrimaryColor = { r: 255, g: 255, b: 255, a: 255 };
            this.data.player.vehicle.customSecondaryColor = { r: 255, g: 255, b: 255, a: 255 };
        } else {
            this.notifyPlayer(null, `${player.data.username} has picked up a canister.`);
        }

        player.canister = this;
        this.data.player = player;
        this.data.player.vehicle.customPrimaryColor = { r: 190, g: 110, b: 255, a: 255 };
        this.data.player.vehicle.customSecondaryColor = { r: 190, g: 110, b: 255, a: 255 };

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
            alt.emit('chat:SendAll', `{BE6EFF}[INFO]{FFFFFF} ${message}`);
            return;
        }

        player.send(`{BE6EFF}[INFO]{FFFFFF} ${message}`);
    }

    playSound(player, dictionary, name) {
        if (!player) {
            alt.emitClient(null, 'sound:Play', dictionary, name);
            return;
        }

        player.emit('sound:Play', dictionary, name);
    }

    tick() {
        if (this.resetting) {
            return;
        }

        if (this.data.player && this.data.player.valid) {
            const canisterDistFromSpawn = distance2d(this.data.player.pos, DEFAULT_CONFIG.SPAWN);
            if (canisterDistFromSpawn <= 15) {
                this.canisterAtSpawnTicks += 1;
            } else {
                this.canisterAtSpawnTicks = 0;
            }

            if (this.canisterAtSpawnTicks >= 50 && !this.resetting) {
                this.canisterAtSpawnTicks = 0;

                if (this.data.player.offenses === undefined) {
                    this.data.player.offenses = 1;
                } else {
                    this.data.player.offenses += 1;
                }

                this.data.player.send(`You were given an offense: ${this.data.player.offenses} (Reset Canister)`);

                const message = `The canister was reset due to being too close to spawn.`;
                this.notifyPlayer(null, message);
                this.reset(null, true);
                return;
            }

            if (distance2d(this.data.player.pos, this.data.goal) <= 5 && !this.resetting) {
                if (!this.data.player.score) {
                    this.data.player.score = 1;
                } else {
                    this.data.player.score += 1;
                }

                const message = `${this.data.player.data.username} has scored! Total score: ${this.data.player.score}`;
                this.notifyPlayer(null, message);
                this.playSound(null, 'HUD_MINI_GAME_SOUNDSET', 'CHECKPOINT_PERFECT');
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
