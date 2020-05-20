import * as native from 'natives';

/**
 * Convert hex to rgb
 * @param  {String} hex
 */
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}

/**
 * Draw text on screen at a 3D location.
 * Requires a zero interval or everytick.
 * @param {String} msg
 * @param {{x,y,z}} pos
 * @param {Number} scale
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 */
export function drawText3d(msg, pos, scale, r, g, b, a) {
    let hex = msg.match('{.*}');
    if (hex) {
        const rgb = hexToRgb(hex[0].replace('{', '').replace('}', ''));
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
        msg = msg.replace(hex[0], '');
    }

    if (scale <= 0.3) {
        scale = 0.3;
    }

    if (scale > 2) {
        scale = 2;
    }

    native.setDrawOrigin(pos.x, pos.y, pos.z, 0);
    native.beginTextCommandDisplayText('STRING');
    native.addTextComponentSubstringPlayerName(msg);
    native.setTextFont(4);
    native.setTextScale(1, scale);
    native.setTextWrap(0.0, 1.0);
    native.setTextCentre(true);
    native.setTextColour(r, g, b, a);
    native.setTextOutline();
    native.setTextDropShadow();
    native.endTextCommandDisplayText(0, 0);
    native.clearDrawOrigin();
}

/**
 * Draw text on the screen.
 * Requires a zero interval or everytick.
 * @param {String} msg
 * @param {{x,y}} pos
 * @param {Number} scale
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 */
export function drawText2d(msg, pos, scale, r, g, b, a) {
    let hex = msg.match('{.*}');
    if (hex) {
        const rgb = hexToRgb(hex[0].replace('{', '').replace('}', ''));
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
        msg = msg.replace(hex[0], '');
    }

    native.beginTextCommandDisplayText('STRING');
    native.addTextComponentSubstringPlayerName(msg);
    native.setTextFont(4);
    native.setTextScale(1, scale);
    native.setTextWrap(0.0, 1.0);
    native.setTextCentre(true);
    native.setTextColour(r, g, b, a);
    native.setTextOutline();
    native.setTextDropShadow();
    native.endTextCommandDisplayText(pos.x, pos.y);
}
