import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const source = process.argv[2] ?? 'public/source-f1.html';
const html = fs.readFileSync(source, 'utf8');
const payload = JSON.parse(html.match(/<script[^>]*id="hospital-offline-payload"[^>]*>([\s\S]*?)<\/script>/)[1]);
const {model, furniture, navigation} = payload.data;
const provenance = {file:'hospital_F1_offline.html', sha256:crypto.createHash('sha256').update(html).digest('hex'), importedAt:'2026-09-08', status:model.metrics.status};
fs.writeFileSync('lib/f1.json', JSON.stringify({model, furniture, pois:navigation.pois, provenance}));
fs.writeFileSync('public/navigation.json', JSON.stringify(navigation));
fs.writeFileSync('research/navigation.json', JSON.stringify(navigation));
if (path.resolve(source) !== path.resolve('public/source-f1.html')) fs.copyFileSync(source, 'public/source-f1.html');
fs.writeFileSync('research/module-routing.js', Buffer.from(payload.modules['hospital-routing'], 'base64'));
console.log(JSON.stringify({rooms:model.rooms.length, doors:model.doors.length, columns:model.columns.length, pois:navigation.pois.length, fingerprint:provenance.sha256}));

