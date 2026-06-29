// Lightweight chat moderation: masks profanity/slurs by inserting a "#" into
// the word (e.g. "rape" -> "r#pe", "fuck" -> "f#ck") so messages stay readable
// but the slur itself is broken up. Matching is whole-word (\b boundaries) and
// case-insensitive, and includes common inflections so "raped"/"raping" etc.
// are caught too.

const BAD_WORDS: string[] = [
  // violent / harassment
  'rape', 'raped', 'raping', 'rapist', 'rapes',
  // strong profanity
  'fuck', 'fucked', 'fucking', 'fucker', 'motherfucker', 'fuckers',
  'shit', 'shitty', 'bullshit',
  'bitch', 'bitches', 'bastard', 'asshole', 'ass', 'dick', 'cock',
  'pussy', 'cunt', 'twat', 'prick', 'wanker', 'whore', 'slut',
  'damn', 'piss', 'crap',
  // slurs
  'nigger', 'nigga', 'niggas', 'niggers', 'faggot', 'fag', 'faggots',
  'retard', 'retarded', 'kike', 'spic', 'chink', 'tranny', 'wetback', 'coon',
];

const VOWELS = 'aeiouAEIOU';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sort longer words first so "motherfucker" masks before "fucker"/"fuck", etc.
const PATTERN = new RegExp(
  '\\b(' +
    [...BAD_WORDS]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|') +
    ')\\b',
  'gi',
);

function maskWord(word: string): string {
  const chars = word.split('');
  // Replace the first interior vowel with "#" (keeps the word recognizably
  // censored, like the "r#pe" example). Fall back to the middle character.
  for (let i = 1; i < chars.length; i++) {
    if (VOWELS.includes(chars[i])) {
      chars[i] = '#';
      return chars.join('');
    }
  }
  if (word.length > 1) chars[Math.floor(word.length / 2)] = '#';
  return chars.join('');
}

export function censor(text: string): string {
  return text.replace(PATTERN, (match) => maskWord(match));
}

export function containsProfanity(text: string): boolean {
  PATTERN.lastIndex = 0;
  return PATTERN.test(text);
}
