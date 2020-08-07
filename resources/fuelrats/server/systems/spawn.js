import * as alt from 'alt';
import { DEFAULT_CONFIG } from '../configuration/config';

alt.on('sync:Player', spawnPlayer);

export function spawnPlayer(player) {
    player.model = 'mp_m_freemode_01';
    player.spawn(DEFAULT_CONFIG.SPAWN.x, DEFAULT_CONFIG.SPAWN.y, DEFAULT_CONFIG.SPAWN.z, 0);
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
