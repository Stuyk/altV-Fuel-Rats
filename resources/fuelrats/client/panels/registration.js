import * as alt from 'alt';
import * as native from 'natives';
import { showCursor } from '../utility/cursor';

let view;

alt.onServer('panel:Registration', initializeRegistration);
alt.onServer('panel:Registration:Close', closeRegistration);
alt.onServer('panel:Registration:Error', handleError);

function initializeRegistration() {
    if (!view) {
        view = new alt.WebView('http://resource/client/html/registration/index.html');
        view.on('registration:Route', handleRegistration);
    }

    view.focus();
    showCursor(true);
    alt.toggleGameControls(false);
    alt.Player.local.viewActive = true;
    native.doScreenFadeOut(0);
}

function handleRegistration(username, password, register = false) {
    if (!register) {
        alt.emitServer('registration:Login', username, password);
        return;
    }

    alt.emitServer('registration:Register', username, password);
}

function handleError(message) {
    if (!view) {
        return;
    }

    view.emit('registration:Error', message);
}

function closeRegistration() {
    view.destroy();
    view = null;
    alt.Player.local.viewActive = false;
    alt.toggleGameControls(true);
    showCursor(false);
}
