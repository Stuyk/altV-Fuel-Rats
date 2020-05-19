import * as alt from 'alt';

let count = 0;

export function showCursor(toggle) {
    if (toggle) {
        alt.showCursor(true);
        count += 1;
    } else {
        for (let i = 0; i < count + 1; i++) {
            try {
                alt.showCursor(false);
            } catch (err) {
                // Do Nothing
            }
        }

        count = 0;
    }
}
