// ─── Manifest ────────────────────────────────────────────────────────────────
const MANIFEST = {
  id: 'br.dublado.torbox.v2',
  version: '2.0.0',
  name: '🇧🇷 Dublado BR + Torbox',
  description: 'Filmes e séries dublados em PT-BR. Busca em Vaca Torrent, Comando Torrents, BLUDV e mais.',
  types: ['movie', 'series'],
  catalogs: [],
  resources: ['stream'],
  idPrefixes: ['tt'],
  behaviorHints: { configurable: true, configurationRequired: true },
  config: [
    {
      key: 'torboxApiKey',
      type: 'text',
      title: '🔑 Chave de API do Torbox (torbox.app → Settings → API)',
      required: true
    },
    {
      key: 'indexerUrl',
      type: 'text',
      title: '🌐 URL do seu Torrent Indexer (ex: https://meu-indexer.koyeb.app)',
      required: true
    },
    {
      key: 'indexers',
      type: 'select',
      title: '📂 Sites para buscar',
      options: ['todos', 'vaca_torrent', 'comando_torrents', 'bludv', 'torrent-dos-filmes', 'rede_torrent', 'starck-filmes'],
      default: 'todos'
    },
    {
      key: 'qualidade',
      type: 'select',
      title: '🎬 Qualidade preferida',
      options: ['Qualquer', '4K', '1080p', '720p'],
      default: '1080p'
    }
  ]
};

// ─── Qualidade e filtros ──────────────────────────────────────────────────────
const QUALITY_MAP = {
  '4K':    ['2160p','4k','uhd','ultrahd'],
  '1080p': ['1080p','1080i','fullhd','fhd'],
  '720p':  ['720p','hdready'],
  'SD':    ['480p','dvdrip','hdcam','cam']
};

function detectQuality(nome) {
  const n = (nome || '').toLowerCase().replace(/[._\-]/g, ' ');
  for (const [q, keys] of Object.entries(QUALITY_MAP)) {
    if (keys.some(k => n.includes(k))) return q;
  }
  return null;
}

function qualityPriority(q) {
  return ({ '4K': 0, '1080p': 1, '720p': 2, 'SD': 3 })[q] ?? 4;
}

function formatBytes(bytes) {
  if (!bytes) return '?';
  const gb = bytes / 1024 ** 3;
  return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(0)} MB`;
}

function seedIcon(s) {
  if (!s) return '⚪';
  return s >= 50 ? '🟢' : s >= 10 ? '🟡' : '🔴';
}

// Mapeia o nome do indexer para um emoji/label bonito
const INDEXER_LABELS = {
  vaca_torrent:       '🐄 Vaca Torrent',
  comando_torrents:   '⚡ Comando Torrents',
  bludv:              '🔵 BLUDV',
  'torrent-dos-filmes': '🎬 Torrent dos Filmes',
  rede_torrent:       '🌐 Rede Torrent',
  'starck-filmes':    '⭐ Starck Filmes',
};

function indexerLabel(indexer) {
  return INDEXER_LABELS[indexer] || indexer || 'BR';
}

// Converte resultado do torrent-indexer em stream do Stremio
function toStream(result, streamUrl) {
  const q   = detectQuality(result.title || result.original_title || '');
  const src = indexerLabel(result.indexer);
  const seeds = result.seed_count || 0;

  return {
    name:  `${src}\n${q ? `[${q}]` : ''}`,
    title: `${result.title || result.original_title || 'Sem título'}\n${seedIcon(seeds)} ${seeds} seeds · 💾 ${formatBytes(result.size)}`,
    url:   streamUrl,
    behaviorHints: { bingeGroup: `br-torbox-${q || 'sd'}` }
  };
}

// Ordena por qualidade preferida e seeds
function sortResults(results, qualPref) {
  return [...results].sort((a, b) => {
    if (qualPref && qualPref !== 'Qualquer') {
      const aMatch = detectQuality(a.title || '') === qualPref ? 0 : 1;
      const bMatch = detectQuality(b.title || '') === qualPref ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    const qa = qualityPriority(detectQuality(a.title || ''));
    const qb = qualityPriority(detectQuality(b.title || ''));
    if (qa !== qb) return qa - qb;
    return (b.seed_count || 0) - (a.seed_count || 0);
  });
}

// Decodifica config que o Stremio manda em base64
function decodeConfig(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(Buffer.from(decodeURIComponent(raw), 'base64').toString('utf8'));
  } catch {
    try { return Object.fromEntries(new URLSearchParams(raw)); }
    catch { return {}; }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json'
  };
}

module.exports = { MANIFEST, detectQuality, toStream, sortResults, decodeConfig, corsHeaders, formatBytes, seedIcon };
