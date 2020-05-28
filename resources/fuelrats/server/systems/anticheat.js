import * as alt from 'alt';

alt.onClient('anticheat:Teleport', player => {
    alt.emit('chat:SendAll', `{FF0000}${player.name} was kicked for moving too fast.`);
    player.kick();
});
