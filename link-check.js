import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TOML from '@iarna/toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PARTICIPANTS_DIR = path.join(__dirname, '_src/_data/participants');
const SAMPLE_SIZE = Infinity;
const DELAY_MS = 100;
const UPDATE_FILES = true;
const BATCH_SIZE = 100;

function getTomlFiles(dir, limit = Infinity) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.toml'))
    .slice(0, limit)
    .map(f => path.join(dir, f));
}

function getMaxYear(years) {
  return Math.max(...years);
}

async function checkUrl(url) {
  if (isArchiveUrl(url)) {
    return true;
  }
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

function isArchiveUrl(url) {
  return url.includes('web.archive.org/web/');
}

function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

async function getArchiveUrl(originalUrl, targetYear) {
  try {
    const normUrl = normalizeUrl(originalUrl);
    const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(normUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.archived_snapshots || !data.archived_snapshots.closest) {
      return null;
    }

    const snapshot = data.archived_snapshots.closest;
    const snapshotYear = parseInt(snapshot.timestamp.slice(0, 4), 10);

    if (snapshotYear <= targetYear) {
      return snapshot.url;
    }

    for (let year = targetYear - 1; year >= 2005; year--) {
      const altUrl = `https://web.archive.org/web/${year}/${normUrl}`;
      const checkRes = await fetch(altUrl, { method: 'HEAD' });
      if (checkRes.status === 200) {
        return altUrl;
      }
    }

    return snapshot.url;
  } catch {
    return null;
  }
}

async function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = TOML.parse(content);
  const results = [];

  if (!data.websites || data.websites.length === 0) {
    return results;
  }

  for (const site of data.websites) {
    const originalUrl = site.url;
    const years = site.years || [];
    const maxYear = getMaxYear(years);
    const isAlive = await checkUrl(originalUrl);

    results.push({
      file: path.basename(filePath),
      originalUrl,
      maxYear,
      isAlive,
      newUrl: null
    });

    if (!isAlive) {
      await new Promise(r => setTimeout(r, DELAY_MS));
      const archiveUrl = await getArchiveUrl(originalUrl, maxYear);
      if (archiveUrl) {
        results[results.length - 1].newUrl = archiveUrl;
      } else {
        const normUrl = normalizeUrl(originalUrl);
        results[results.length - 1].newUrl = `https://web.archive.org/web/${normUrl}`;
      }

      if (UPDATE_FILES && results[results.length - 1].newUrl) {
        const newContent = content.replace(
          `url = "${originalUrl}"`,
          `url = "${results[results.length - 1].newUrl}"`
        );
        fs.writeFileSync(filePath, newContent);
      }
    }
  }

  return results;
}

async function main() {
  const files = getTomlFiles(PARTICIPANTS_DIR, SAMPLE_SIZE);
  let allResults = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    for (let j = 0; j < batch.length; j++) {
      const file = batch[j];
      try {
        console.error(`Processing ${i + j + 1}/${files.length}: ${path.basename(file)}`);
        const fileResults = await processFile(file);
        allResults.push(...fileResults);
      } catch (err) {
        console.error(`Error processing ${path.basename(file)}: ${err.message}`);
      }
    }

    const csv = [
      'file,original_url,max_year,is_alive,new_url',
      ...allResults.map(r =>
        `"${r.file}","${r.originalUrl}","${r.maxYear}","${r.isAlive}","${r.newUrl || ''}"`
      )
    ].join('\n');
    fs.writeFileSync(path.join(__dirname, 'link-check-results.csv'), csv);
  }

  console.error(`\nDone: ${allResults.length} sites processed`);
}

main().catch(console.error);
