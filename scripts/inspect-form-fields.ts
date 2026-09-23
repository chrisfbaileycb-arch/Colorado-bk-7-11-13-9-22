// Lists the AcroForm field names in an official form PDF, for building its field map.
// Usage: bun run forms:inspect public/forms/official/form_b101.pdf
import { readFile } from 'node:fs/promises';
import { listFormFields } from '../lib/engine/pdf/official-form-filler';

const file = process.argv[2];
if (!file) {
  console.error('Usage: bun run forms:inspect <path-to-official-form.pdf>');
  process.exit(1);
}
const fields = await listFormFields(new Uint8Array(await readFile(file)));
console.log(`${fields.length} fields in ${file}`);
for (const f of fields) console.log(`${f.type.padEnd(12)} ${f.name}`);
