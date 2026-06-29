#!/usr/bin/env node
/**
 * Post-build step for the web export.
 *
 * Injects a branded splash screen (dark #111 background + Synkoz logo) directly
 * into the generated index.html so it paints on the very first frame — before
 * the JS bundle loads — like the Roblox / TikTok web splash. The overlay fades
 * out automatically once the React app has mounted into #root.
 *
 * Runs after `expo export -p web` (see vercel.json buildCommand). It is written
 * to never fail the build: any problem is logged and the script exits 0.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const INDEX = path.join(DIST, 'index.html');
const LOGO_SRC = path.resolve(__dirname, '..', 'assets', 'splash-web.png');
const LOGO_OUT = path.join(DIST, 'synkoz-splash.png');
const LOGO_URL = '/synkoz-splash.png';

function main() {
  if (!fs.existsSync(INDEX)) {
    console.warn('[inject-web-splash] dist/index.html not found; skipping.');
    return;
  }

  // Copy the splash logo into the build output under a stable name.
  try {
    fs.copyFileSync(LOGO_SRC, LOGO_OUT);
  } catch (e) {
    console.warn('[inject-web-splash] could not copy splash logo:', e.message);
  }

  let html = fs.readFileSync(INDEX, 'utf8');

  if (html.includes('id="synkoz-splash"')) {
    console.log('[inject-web-splash] splash already present; skipping.');
    return;
  }

  const style = `
    <style id="synkoz-splash-style">
      html, body { background-color: #111111; }
      #synkoz-splash {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background-color: #111111;
        opacity: 1; transition: opacity 0.45s ease;
      }
      #synkoz-splash.synkoz-hide { opacity: 0; pointer-events: none; }
      #synkoz-splash img {
        width: clamp(180px, 62vw, 520px); height: auto;
        animation: synkoz-pulse 1.6s ease-in-out infinite;
      }
      @keyframes synkoz-pulse {
        0%, 100% { transform: scale(0.985); opacity: 0.92; }
        50%      { transform: scale(1.015); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        #synkoz-splash img { animation: none; }
      }
    </style>`;

  const overlay = `
    <div id="synkoz-splash" role="status" aria-label="Loading Synkoz">
      <img src="${LOGO_URL}" alt="Synkoz" />
    </div>
    <script>
      (function () {
        var MIN_MS = 800, MAX_MS = 5000, start = Date.now();
        function hide() {
          var el = document.getElementById('synkoz-splash');
          if (!el || el.classList.contains('synkoz-hide')) return;
          el.classList.add('synkoz-hide');
          setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 600);
        }
        function ready() {
          var wait = Math.max(0, MIN_MS - (Date.now() - start));
          setTimeout(hide, wait);
        }
        var root = document.getElementById('root');
        if (root && root.childNodes.length > 0) { ready(); return; }
        if (root && 'MutationObserver' in window) {
          var obs = new MutationObserver(function () {
            if (root.childNodes.length > 0) { obs.disconnect(); ready(); }
          });
          obs.observe(root, { childList: true });
        }
        // Fallbacks in case mount detection misses.
        window.addEventListener('load', function () { setTimeout(ready, 400); });
        setTimeout(hide, MAX_MS);
      })();
    </script>`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', style + '\n  </head>');
  } else {
    html = style + html;
  }

  if (html.includes('</body>')) {
    html = html.replace('</body>', overlay + '\n  </body>');
  } else {
    html += overlay;
  }

  fs.writeFileSync(INDEX, html);
  console.log('[inject-web-splash] splash injected into dist/index.html');
}

try {
  main();
} catch (e) {
  console.warn('[inject-web-splash] non-fatal error:', e && e.message);
}
process.exit(0);
