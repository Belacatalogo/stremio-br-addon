const { MANIFEST, corsHeaders } = require('./_shared');

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204, corsHeaders()); return res.end(); }
  res.writeHead(200, corsHeaders());
  res.end(JSON.stringify(MANIFEST));
};
