/**
 * Browser file plumbing for the fixed Team preset format: read one chosen
 * document, and offer one Team as a download.
 * @module dsh-agent-team-presets/preset-file
 */
import type { TeamPreset } from '../types.ts';
/**
 * Derive the file name one Team downloads under.
 * @param team - the Team being exported.
 * @returns a `.json` file name built from the Team's name, or from its identity.
 */
export declare function presetFileName(team: TeamPreset): string;
/**
 * Read one chosen document as text.
 * @param file - the file the user picked.
 * @returns the file's text.
 */
export declare function readPresetFile(file: File): Promise<string>;
/**
 * Offer one Team document as a download.
 * @param fileName - the name the browser saves it under.
 * @param text - the document body.
 */
export declare function downloadPresetText(fileName: string, text: string): void;
//# sourceMappingURL=preset-file.d.ts.map