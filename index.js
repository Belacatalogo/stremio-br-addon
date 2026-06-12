module.exports = function handler(req, res) {
  const host  = req.headers.host || 'seu-addon.vercel.app';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const base  = `${proto}://${host}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🇧🇷 Dublado BR + Torbox</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #09090f;
      color: #ddd;
      padding: 24px 16px 48px;
      min-height: 100vh;
    }
    .wrap { max-width: 520px; margin: 0 auto; }

    .hero {
      text-align: center;
      padding: 40px 0 32px;
    }
    .flag { font-size: 3.5rem; display: block; margin-bottom: 12px; }
    h1 { font-size: 1.9rem; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .tagline { color: #888; font-size: 0.9rem; margin-top: 6px; }

    .sites {
      display: flex; flex-wrap: wrap; gap: 6px;
      justify-content: center;
      margin: 20px 0 32px;
    }
    .site-badge {
      background: #1a1a2e;
      border: 1px solid #2a2a44;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 0.78rem;
      color: #aaa;
    }

    .card {
      background: #111118;
      border: 1px solid #222230;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555;
      margin-bottom: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .card-title::after {
      content: ''; flex: 1; height: 1px; background: #222;
    }

    .step {
      display: flex; gap: 14px; align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #1a1a1a;
    }
    .step:last-child { border-bottom: none; }
    .step-num {
      background: #7c3aed22;
      color: #a78bfa;
      border: 1px solid #7c3aed44;
      border-radius: 50%;
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700;
      flex-shrink: 0; margin-top: 2px;
    }
    .step-text { font-size: 0.88rem; color: #bbb; line-height: 1.5; }
    .step-text strong { color: #eee; }
    .step-text a { color: #a78bfa; text-decoration: none; }
    .step-text code {
      background: #1e1e2e;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 0.82rem;
      color: #c4b5fd;
      font-family: monospace;
    }

    .btn {
      display: block; width: 100%;
      padding: 14px; border-radius: 12px;
      font-size: 0.95rem; font-weight: 700;
      text-decoration: none; text-align: center;
      margin-bottom: 10px; border: none; cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.85; }
    .btn-install { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
    .btn-ghost   { background: #111118; color: #888; border: 1px solid #2a2a3d; font-size: 0.85rem; }

    .url-row {
      display: flex; gap: 8px; align-items: center;
      background: #0d0d16; border: 1px solid #2a2a3d;
      border-radius: 10px; padding: 10px 14px;
    }
    .url-text {
      font-family: monospace; font-size: 0.78rem;
      color: #a78bfa; flex: 1; word-break: break-all;
    }
    .copy-btn {
      background: #1e1e2e; border: 1px solid #333; border-radius: 6px;
      color: #aaa; font-size: 0.75rem; padding: 4px 10px;
      cursor: pointer; white-space: nowrap; flex-shrink: 0;
    }
    .copy-btn:hover { background: #2a2a3d; }
    .copied-msg { font-size: 0.75rem; color: #22c55e; text-align: center; margin-top: 6px; height: 16px; }

    .arch {
      font-family: monospace; font-size: 0.8rem; color: #666;
      background: #0d0d16; border: 1px solid #1e1e2e;
      border-radius: 10px; padding: 16px;
      line-height: 1.8; white-space: pre;
    }
    .arch .hi { color: #a78bfa; }
    .arch .gr { color: #4ade80; }
    .arch .ye { color: #facc15; }
  </style>
</head>
<body>
<div class="wrap">

  <div class="hero">
    <span class="flag">🇧🇷</span>
    <h1>Dublado BR + Torbox</h1>
    <p class="tagline">Addon para Stremio · Sites brasileiros de torrent · Stream via Torbox</p>
  </div>

  <div class="sites">
    <span class="site-badge">🐄 Vaca Torrent</span>
    <span class="site-badge">⚡ Comando Torrents</span>
    <span class="site-badge">🔵 BLUDV</span>
    <span class="site-badge">🎬 Torrent dos Filmes</span>
    <span class="site-badge">🌐 Rede Torrent</span>
    <span class="site-badge">⭐ Starck Filmes</span>
  </div>

  <!-- Como funciona -->
  <div class="card">
    <div class="card-title">Como funciona</div>
    <div class="arch"><span class="hi">Stremio</span>
  ↓ pede streams para um filme/série
<span class="hi">Addon (Vercel)</span>
  ↓ busca pelo IMDB ID nos sites BR
<span class="gr">Seu Indexer (Koyeb)</span> ← scrapa:
  ├─ Vaca Torrent
  ├─ Comando Torrents
  ├─ BLUDV e mais...
  ↓ retorna magnets
<span class="ye">Torbox</span> → gera link de stream
  ↓
<span class="hi">Stremio</span> reproduz 🎬</div>
  </div>

  <!-- Instalar -->
  <div class="card">
    <div class="card-title">Instalar no Stremio</div>
    <a class="btn btn-install" href="stremio://addon/install/${base}/manifest.json">
      ▶ Instalar no Stremio
    </a>
    <div class="url-row">
      <span class="url-text" id="addonUrl">${base}/manifest.json</span>
      <button class="copy-btn" onclick="copyUrl()">Copiar</button>
    </div>
    <div class="copied-msg" id="copiedMsg"></div>
    <a class="btn btn-ghost" href="/manifest.json" target="_blank" style="margin-top:10px">Ver manifest.json</a>
  </div>

  <!-- Passo a passo -->
  <div class="card">
    <div class="card-title">Configuração — passo a passo</div>

    <div class="step">
      <div class="step-num">1</div>
      <div class="step-text">
        Acesse <a href="https://koyeb.com" target="_blank">koyeb.com</a> e crie uma conta grátis (não precisa de cartão)
      </div>
    </div>

    <div class="step">
      <div class="step-num">2</div>
      <div class="step-text">
        Clique em <strong>Create Service → Docker</strong><br>
        Image: <code>felipemarinho97/torrent-indexer:latest</code>
      </div>
    </div>

    <div class="step">
      <div class="step-num">3</div>
      <div class="step-text">
        Em <strong>Environment Variables</strong>, adicione:<br>
        <code>PORT = 8000</code>
      </div>
    </div>

    <div class="step">
      <div class="step-num">4</div>
      <div class="step-text">
        Clique em <strong>Deploy</strong>. Em ~2 min você vai ter uma URL tipo:<br>
        <code>https://meu-indexer.koyeb.app</code>
      </div>
    </div>

    <div class="step">
      <div class="step-num">5</div>
      <div class="step-text">
        No Stremio, instale este addon e nas <strong>configurações</strong> coloque:<br>
        • Chave do Torbox (torbox.app → Settings → API)<br>
        • URL do seu indexer do Koyeb
      </div>
    </div>

    <div class="step">
      <div class="step-num">6</div>
      <div class="step-text">
        Pronto! Abra qualquer filme ou série e os streams brasileiros vão aparecer 🎉
      </div>
    </div>
  </div>

</div>

<script>
  function copyUrl() {
    const txt = document.getElementById('addonUrl').textContent;
    navigator.clipboard.writeText(txt).then(() => {
      document.getElementById('copiedMsg').textContent = '✓ Copiado!';
      setTimeout(() => document.getElementById('copiedMsg').textContent = '', 2000);
    });
  }
</script>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
};
