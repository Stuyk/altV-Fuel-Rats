import * as alt from 'alt';
import { DEFAULT_CONFIG } from '../configuration/config';

alt.on('sync:Player', spawnPlayer);

const spawn = { x: 1068.10546875, y: 3049.371337890625, z: 41.2769775390625 };

export function spawnPlayer(player) {
    player.model = 'mp_m_freemode_01';
    player.spawn(spawn.x, spawn.y, spawn.z, 0);
    player.dimension = Math.floor(Math.random() * 5000);
    player.setWeather(5);

    const currentDate = new Date(Date.now());
    player.setDateTime(currentDate.getDay(), currentDate.getMonth(), currentDate.getFullYear(), 10, 0, 0);

    alt.setTimeout(() => {
        if (!player || !player.valid) {
            return;
        }

        player.emit('vehicle:Pick', DEFAULT_CONFIG.VALID_VEHICLES);
    }, 500);
}
