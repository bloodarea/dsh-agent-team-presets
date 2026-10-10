/**
 * Browser file plumbing for the fixed Team preset format: read one chosen
 * document, and offer one Team as a download.
 * @module dsh-agent-team-presets/preset-file
 */
/** Characters a generated file name may keep. */
const UNSAFE_NAME = /[^\p{L}\p{N}._-]+/gu;
/** File name stem length, so one long Team name cannot produce a huge name. */
const MAX_STEM = 64;
/**
 * Derive the file name one Team downloads under.
 * @param team - the Team being exported.
 * @returns a `.json` file name built from the Team's name, or from its identity.
 */
export function presetFileName(team) {
    const label = (team.name.trim() === '' ? team.id : team.name.trim())
        .replace(UNSAFE_NAME, '-')
        .replace(/^-+|-+$/gu, '')
        .slice(0, MAX_STEM);
    return `${label === '' ? 'team' : label}.json`;
}
/**
 * Read one chosen document as text.
 * @param file - the file the user picked.
 * @returns the file's text.
 */
export async function readPresetFile(file) {
    return await file.text();
}
/**
 * Offer one Team document as a download.
 * @param fileName - the name the browser saves it under.
 * @param text - the document body.
 */
export function downloadPresetText(fileName, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
