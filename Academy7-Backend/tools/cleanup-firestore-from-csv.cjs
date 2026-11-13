#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccountPath = process.argv[2];
const csvPath = process.argv[3] || './academy7-account-credentials.csv';
const dryRun = process.argv.includes('--dry-run');
if (!serviceAccountPath) {
  console.error('Uso: node tools/cleanup-firestore-from-csv.cjs <serviceAccountKey.json> [csv] [--dry-run]');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function parseLine(line) {
  const values = []; let value = ''; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { values.push(value.trim()); value = ''; }
    else value += char;
  }
  values.push(value.trim());
  return values;
}
function loadAllowedIds(filePath) {
  const lines = fs.readFileSync(path.resolve(filePath), 'utf8').split(/\r?\n/).filter(Boolean);
  const headers = parseLine(lines.shift()).map((item) => item.toLowerCase());
  const usernameIndex = headers.indexOf('username');
  const emailIndex = headers.indexOf('email');
  if (usernameIndex < 0 || emailIndex < 0) throw new Error('El CSV debe contener username y email.');
  const ids = new Set();
  for (const line of lines) {
    const values = parseLine(line);
    if (values[usernameIndex]) ids.add(values[usernameIndex].toLowerCase());
    if (values[emailIndex]) ids.add(values[emailIndex].toLowerCase().split('@')[0]);
  }
  return ids;
}
async function main() {
  const allowed = loadAllowedIds(csvPath);
  const collections = ['users', 'students', 'guardians', 'teachers', 'loginAliases'];
  let candidates = [];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    for (const item of snapshot.docs) {
      if (!allowed.has(item.id.toLowerCase())) candidates.push({ collectionName, item });
    }
  }
  console.log(`Identificadores permitidos por CSV: ${allowed.size}`);
  console.log(`Documentos antiguos candidatos: ${candidates.length}`);
  candidates.slice(0, 30).forEach(({ collectionName, item }) => console.log(`- ${collectionName}/${item.id}`));
  if (dryRun) { console.log('Modo simulación: no se eliminó ningún documento.'); return; }
  for (const { collectionName, item } of candidates) {
    if (collectionName === 'teachers') await db.recursiveDelete(item.ref);
    else await item.ref.delete();
  }
  console.log(`Documentos eliminados: ${candidates.length}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
