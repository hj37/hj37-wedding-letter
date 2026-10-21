import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../script.js', import.meta.url), 'utf8');
const readConstant = (name) => {
  const match = appSource.match(new RegExp(`const ${name}\\s*=\\s*'([^']+)'`));
  if (!match) throw new Error(`Could not find ${name} in script.js`);
  return match[1];
};

const projectUrl = readConstant('SUPABASE_URL');
const anonKey = readConstant('SUPABASE_KEY');
const endpoint = new URL('/rest/v1/wedding_guestbook?select=id&limit=1', projectUrl);

const response = await fetch(endpoint, {
  headers: {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: 'application/json',
  },
  signal: AbortSignal.timeout(15000),
});

if (!response.ok) {
  const detail = await response.text();
  throw new Error(`Supabase activity check failed (${response.status}): ${detail}`);
}

console.log(`Supabase read-only activity request succeeded (${response.status}).`);
