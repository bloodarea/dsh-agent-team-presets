/**
 * The one keyword matcher the editor's two pick-fields share.
 *
 * Both the tool allow-list and the Team Skill assignment grid are long enough
 * that a reader scrolls and guesses; each therefore offers a keyword box that
 * narrows what it shows. One matcher serves both so the two boxes can never
 * disagree about what a keyword means — the same rule the Team list already
 * applies through {@link queryTokens}.
 *
 * Matching is deliberately local and explainable, with no model call and no
 * vector index: every whitespace-separated token must appear somewhere in the
 * indexed text. "Approximate" means a token may match by substring (`shell` finds
 * `run_shell_command`), and, for a token of three characters or more, by character
 * subsequence (`spwn` finds `spawn_team_member`). A filter only decides what is
 * listed; it never rewrites a stored selection.
 * @module dsh-agent-team-presets/keyword-search
 */
/**
 * Split a keyword box's text into the lowercase tokens it matches by.
 *
 * Same rules as the Team list search — whitespace separates tokens, every token
 * is required — because a reader typing in one box should not have to learn a
 * second grammar for the next one.
 * @param query - raw text of the keyword box.
 * @returns lowercase tokens in input order; no tokens for an empty box.
 */
export declare function keywordTokens(query: string): string[];
/**
 * Whether one entry matches a keyword box's tokens.
 *
 * @param tokens - tokens from {@link keywordTokens}; empty means "no filter".
 * @param fields - the text a reader may search for this entry, such as its
 *   name, its description, and the label of the group it is listed under.
 * @returns whether the entry should stay visible; `true` for an empty box.
 */
export declare function matchKeyword(tokens: readonly string[], fields: readonly string[]): boolean;
