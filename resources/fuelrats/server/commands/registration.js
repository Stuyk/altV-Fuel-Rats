import * as alt from 'alt';
import chalk from 'chalk';
import { registerCmd } from '../systems/chat';

alt.log(chalk.greenBright('Loaded: commands/registration'));

registerCmd('login', '/login | Login to your account', (player, args) => {
    if (args.length <= 1) {
        player.send(`/login <username> <password>`);
        return;
    }

    const [username, password] = args;

    if (username <= 3) {
        player.send(`{FF0000}Your username must be at least 4 characters.`);
        return;
    }

    alt.emit('registration:Login', player, username, password);
});

registerCmd('register', '/register | Login to your account', (player, args) => {
    if (args.length <= 1) {
        player.send(`/register <username> <password>`);
        return;
    }

    const [username, password] = args;

    if (username <= 3) {
        player.send(`{FF0000}Your username must be at least 4 characters.`);
        return;
    }

    alt.emit('registration:Register', player, username, password);
});
