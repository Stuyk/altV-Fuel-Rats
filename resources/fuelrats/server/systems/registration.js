import * as alt from 'alt';
import Database from './database';
import { encryptPassword, verifyPassword } from '../utility/encryption';

const db = new Database();

alt.on('registration:Login', login);
alt.on('registration:Register', register);
alt.onClient('registration:Login', login);
alt.onClient('registration:Register', register);

/**
 * Login to an existing account.
 * @param {alt.Player} player
 * @param {String} username
 * @param {String} password
 */
async function login(player, username, password) {
    const arrayOfAccounts = await db.fetchAllByField('username', username, 'accounts');

    if (arrayOfAccounts.length <= 0 || arrayOfAccounts.length >= 2) {
        player.send(`Username or password is incorrect.`);
        player.emit('panel:Registration:Error', 'Username or password is incorrect.');
        return;
    }

    const accountData = arrayOfAccounts[0];
    const hashMatches = verifyPassword(password, accountData.password);

    if (!hashMatches) {
        player.send(`Username or password is incorrect.`);
        player.emit('panel:Registration:Error', 'Username or password is incorrect.');
        return;
    }

    const players = alt.Player.all.filter(target => {
        if (target.data && target.data.username === username) {
            return target;
        }
    });

    if (players.length >= 1) {
        player.send('Account is already logged in.');
        player.emit('panel:Registration:Error', 'Account is already logged in.');
        return;
    }

    player.sync(accountData);
    player.emit('login');
}

/**
 * Register a new account into the database.
 * @param  {alt.Player} player
 * @param  {String} username
 * @param  {String} password
 */
async function register(player, username, password) {
    const arrayOfAccounts = await db.fetchAllByField('username', username, 'accounts');

    if (arrayOfAccounts.length >= 1) {
        player.send(`Username already exists.`);
        player.emit('panel:Registration:Error', 'Username already exists.');
        return;
    }

    const data = {
        username,
        password: encryptPassword(password)
    };

    const accountData = await db.insertData(data, 'accounts', true);
    player.sync(accountData);
    player.emit('login');
}
