import { createCipheriv, randomBytes, pbkdf2Sync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const root = process.cwd();
const sourceDir = join(root, 'photos', 'originals');
const outputDir = join(root, 'photos', 'encrypted');
const secret = process.env.WEDDING_PHOTOS_PASSPHRASE;
if (!secret) throw new Error('Set WEDDING_PHOTOS_PASSPHRASE in your local environment first.');
if (!existsSync(sourceDir)) throw new Error(`Photo folder not found: ${sourceDir}`);
mkdirSync(outputDir, { recursive: true });

for (const name of readdirSync(sourceDir)) {
  if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(secret, salt, 310_000, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(readFileSync(join(sourceDir, name))), cipher.final()]);
  const output = Buffer.concat([Buffer.from('WPH1'), salt, iv, cipher.getAuthTag(), encrypted]);
  const target = join(outputDir, `${basename(name, extname(name))}${extname(name)}.enc`);
  writeFileSync(target, output);
  console.log(`Encrypted ${name} -> photos/encrypted/${basename(target)}`);
}