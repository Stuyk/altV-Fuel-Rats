import * as alt from 'alt';
import dotenv from 'dotenv';
import Database from './systems/database';
import chalk from 'chalk';

dotenv.config();
new Database();

alt.on('database:Ready', databaseReady);

const filesToLoad = [
    './commands/registration',
    './commands/utility',
    './configuration/config',
    './events/playerConnect',
    './events/playerDeath',
    './events/playerDisconnect',
    './events/playerEnterVehicle',
    './events/playerLeaveVehicle',
    './prototypes/player',
    './systems/chat',
    './systems/account',
    './systems/registration',
    './systems/scrum',
    './systems/spawn',
    './systems/vehicles',
    './utility/array'
];

async function databaseReady() {
    const startTime = Date.now();
    let loaded = 0;
    const promises = [];
    for (let i = 0; i < filesToLoad.length; i++) {
        const filePath = filesToLoad[i];
        promises.push(
            import(filePath).catch(err => {
                console.log(err);
                process.exit(0);
            })
        );

        loaded += 1;
    }

    Promise.all(promises).then(() => {
        alt.log(chalk.greenBright(`Finished Loading ${loaded} files in ${Date.now() - startTime}ms`));
    });
}

alt.log(chalk.cyanBright('The resource has now started! PogChamp'));
