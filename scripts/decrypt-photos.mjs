import { createDecipheriv, pbkdf2Sync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const inputDir = process.env.PHOTOS_INPUT_DIR || 'photos/encrypted';
const outputDir = process.env.PHOTOS_OUTPUT_DIR || 'dist/images';
const secret = process.env.WEDDING_PHOTOS_PASSPHRASE;
if (!secret) throw new Error('WEDDING_PHOTOS_PASSPHRASE is required.');
if (!existsSync(inputDir)) process.exit(0);
mkdirSync(outputDir, { recursive: true });

for (const name of readdirSync(inputDir).filter((file) => file.endsWith('.enc'))) {
  const payload = readFileSync(join(inputDir, name));
  if (payload.subarray(0, 4).toString() !== 'WPH1' || payload.length < 48) {
    throw new Error(`Invalid encrypted photo: ${name}`);
  }
  const salt = payload.subarray(4, 20);
  const iv = payload.subarray(20, 32);
  const tag = payload.subarray(32, 48);
  const key = pbkdf2Sync(secret, salt, 310_000, 32, 'sha256');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const clear = Buffer.concat([decipher.update(payload.subarray(48)), decipher.final()]);
  const outputName = basename(name, '.enc');
  writeFileSync(join(outputDir, outputName), clear);
  console.log(`Decrypted ${name} -> ${outputName}`);
}