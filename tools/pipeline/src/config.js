import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const dataDir = () => process.env.PIPELINE_DATA_DIR || path.join(ROOT, 'data');

export async function loadYaml(rel) {
  return yamlLoad(await readFile(path.join(ROOT, rel), 'utf8'));
}

// Merged view of config/markets.yaml and config/targets.yaml.
export async function loadConfig() {
  const markets = await loadYaml('config/markets.yaml');
  const targets = await loadYaml('config/targets.yaml');
  const defaults = { ...markets.defaults };
  const list = (targets.targets || []).map((t) => ({ ...targets.defaults, ...t }));
  return { markets: markets.markets, marketDefaults: defaults, targetDefaults: targets.defaults || {}, targets: list };
}

export function marketOf(config, code) {
  const m = config.markets[code];
  if (!m) throw new Error(`Unknown market ${code} (config/markets.yaml)`);
  return { code, ...config.marketDefaults, ...m };
}
