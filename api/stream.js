const axios = require('axios');
const { toStream, sortResults, decodeConfig, corsHeaders } = require('./_shared');

const TORBOX = 'https://api.torbox.app/v1/api';

// ─── Torbox helpers ───────────────────────────────────────────────────────────

async function tbGet(apiKey, path, params = {}) {
  const r = await axios.get(`${TORBOX}${path}`, {
    params,
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 12000
  });
  return r.data?.data;
}

async function tbPost(apiKey, path, body = {}) {
  const r = await axios.post(`${TORBOX}${path}`, body, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 12000
  });
  return r.data?.data;
}

async function getStreamUrl(apiKey, torrentId) {
  try {
    return await tbGet(apiKey, '/torrents/requestdl', { token: true, torrent_id: torrentId });
  } catch { return null; }
}

async function addMagnet(apiKey, magnet) {
  try {
    return await tbPost(apiKey, '/torrents/createtorrent', { magnet });
  } catch { return null; }
}

// ─── Busca no torrent-indexer ─────────────────────────────────────────────────

async function searchIndexer(indexerUrl, indexerName, query, extraParams = {}) {
  try {
    const url = indexerName === 'todos'
      ? `${indexerUrl}/search`
      : `${indexerUrl}/indexers/${indexerName}`;

    const r = await axios.get(url, {
      params: { q: query, filter_results: true, limit: 20, audio: 'por,brazilian', ...extraParams },
      timeout: 15000
    });

    // /search retorna { results: [] }, /indexers/:name retorna { results: [] }
    return r.data?.results || [];
  } catch (e) {
    console.error(`[indexer] erro em ${indexerName}:`, e.message);
    return [];
  }
}

// Busca em TODOS os indexers em paralelo
async function searchAllIndexers(indexerUrl, query, extraParams = {}) {
  const indexers = ['vaca_torrent', 'comando_torrents', 'bludv', 'torrent-dos-filmes', 'rede_torrent', 'starck-filmes'];
  const results = await Promise.allSettled(
    indexers.map(name => searchIndexer(indexerUrl, name, query, extraParams))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap((r, i) => r.value.map(item => ({ ...item, indexer: indexers[i] })));
}

// ─── Handler principal ────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204, corsHeaders()); return res.end(); }

  const { type, id, config: rawConfig } = req.query;
  const config = decodeConfig(rawConfig);

  const apiKey     = config.torboxApiKey;
  const indexerUrl = (config.indexerUrl || '').replace(/\/$/, '');
  const indexerChoice = config.indexers || 'todos';
  const qualPref   = config.qualidade || 'Qualquer';

  // ── Validações ──
  if (!apiKey || !indexerUrl) {
    res.writeHead(200, corsHeaders());
    return res.end(JSON.stringify({
      streams: [{
        name: '⚠️ Configure o addon',
        title: 'Insira a chave do Torbox e a URL do seu Indexer nas configurações.',
        url: '#'
      }]
    }));
  }

  try {
    // Decompor ID do Stremio (filmes: "tt1234567", séries: "tt1234567:2:5")
    const parts   = id.split(':');
    const imdbId  = parts[0];
    const season  = parts[1] ? parseInt(parts[1]) : null;
    const episode = parts[2] ? parseInt(parts[2]) : null;

    // Monta query de busca
    // O torrent-indexer suporta filtro por IMDB via parâmetro "imdb"
    // mas a busca principal é por texto; usamos o IMDB ID como query também
    const extraParams = { imdb: imdbId };
    if (type === 'series' && season) {
      // Adiciona filtro de temporada se suportado
      extraParams.season = season;
    }

    // Busca nos indexers
    let results = indexerChoice === 'todos'
      ? await searchAllIndexers(indexerUrl, imdbId, extraParams)
      : await searchIndexer(indexerUrl, indexerChoice, imdbId, extraParams);

    // Para séries, filtra pelo episódio correto
    if (type === 'series' && season && episode) {
      const epCode = `S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')}`;
      const epAlt  = `${season}x${String(episode).padStart(2,'0')}`;
      const byEp   = results.filter(r => {
        const t = (r.title || r.original_title || '').toLowerCase();
        return t.includes(epCode.toLowerCase()) || t.includes(epAlt.toLowerCase());
      });
      if (byEp.length > 0) results = byEp;
    }

    // Ordena por qualidade e seeds
    results = sortResults(results, qualPref);

    console.log(`[stream] ${type} ${imdbId} → ${results.length} resultados`);

    // Gera streams via Torbox (máx 8 para não demorar)
    const streams = [];
    for (const result of results.slice(0, 8)) {
      try {
        let streamUrl = null;
        const magnet = result.magnet_link;

        if (!magnet) continue;

        // Adiciona o magnet no Torbox e pega o link de stream
        const created = await addMagnet(apiKey, magnet);
        if (created?.id) {
          streamUrl = await getStreamUrl(apiKey, created.id);
        }

        if (streamUrl) {
          streams.push(toStream({ ...result }, streamUrl));
        }
      } catch (e) {
        console.error('[stream item]', e.message);
      }
    }

    if (streams.length === 0) {
      res.writeHead(200, corsHeaders());
      return res.end(JSON.stringify({
        streams: [{
          name: '❌ Nada encontrado',
          title: 'Nenhum resultado nos sites BR para este título. Tente outro.',
          url: '#'
        }]
      }));
    }

    res.writeHead(200, corsHeaders());
    res.end(JSON.stringify({ streams }));

  } catch (err) {
    console.error('[handler]', err.message);
    res.writeHead(500, corsHeaders());
    res.end(JSON.stringify({ streams: [] }));
  }
};
