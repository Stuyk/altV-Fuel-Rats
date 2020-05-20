import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('sound:Play', playSound);

native.startAudioScene('FBI_HEIST_H5_MUTE_AMBIENCE_SCENE'); // Used to stop police sound in town
native.cancelCurrentPoliceReport(); // Used to stop default police radio around/In police vehicle
native.clearAmbientZoneState('AZ_COUNTRYSIDE_PRISON_01_ANNOUNCER_GENERAL', 1, 0); // Turn off prison sound
native.clearAmbientZoneState('AZ_COUNTRYSIDE_PRISON_01_ANNOUNCER_WARNING', 1, 0); // Turn off prison sound
native.clearAmbientZoneState('AZ_COUNTRYSIDE_PRISON_01_ANNOUNCER_ALARM', 1, 0); // Turn off prison sound
native.setAmbientZoneState(0, 0, 0); // Set ambiant sound to 0,0,0
native.clearAmbientZoneState('AZ_DISTANT_SASQUATCH', 0, 0);
native.setAudioFlag('LoadMPData', true);
native.setAudioFlag('DisableFlightMusic', true);

function playSound(dictionary, name) {
    native.playSoundFrontend(1, name, dictionary, true);
}
