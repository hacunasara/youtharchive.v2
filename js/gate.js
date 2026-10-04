(function () {
  var TARGET = new Date('2027-10-22T00:00:00').getTime();
  var PW    = 'QnJvd25Nb25rZXkxMDIy'; // encoded

  function expired()   { return Date.now() >= TARGET; }
  function unlocked()  { try { return sessionStorage.getItem('youth_unlocked') === '1'; } catch(e) { return false; } }
  function setUnlock() { try { sessionStorage.setItem('youth_unlocked', '1'); } catch(e) {} }
  function check(v)    { try { return v === atob(PW); } catch(e) { return false; } }

  if (!expired() || unlocked()) return;

  var isIndex = /^\/?(?:index\.html)?$/.test(location.pathname);

  /* — ocultar contenido en páginas que no son el índice — */
  if (!isIndex) {
    var hide = document.createElement('style');
    hide.id = 'youth-gate-hide';
    hide.textContent = 'body{visibility:hidden!important}';
    document.head.appendChild(hide);
  }

  /* — CSS del overlay — */
  var style = document.createElement('style');
  style.textContent = [
    '#youth-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;',
    'background:var(--bg,#f7f6f3);padding:2rem 1.5rem;font-family:"IBM Plex Mono","Courier New",monospace;}',
    '#youth-gate .g-inner{max-width:480px;width:100%;display:flex;flex-direction:column;gap:2rem;}',
    '#youth-gate .g-eye{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;',
    'color:var(--muted,#888580);font-weight:400;}',
    '#youth-gate .g-text{font-size:.82rem;line-height:1.9;color:var(--fg,#111010);text-align:justify;hyphens:auto;}',
    '#youth-gate .g-text span{color:var(--muted,#888580);}',
    '#youth-gate hr{border:none;border-top:1px solid var(--border,#d8d5cf);margin:0;}',
    '#youth-gate .g-label{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;',
    'color:var(--muted,#888580);font-weight:400;}',
    '#youth-gate .g-row{display:flex;border:1px solid var(--border,#d8d5cf);transition:border-color .15s;}',
    '#youth-gate .g-row:focus-within{border-color:var(--fg,#111010);}',
    '#youth-gate .g-input{flex:1;background:transparent;border:none;outline:none;min-width:0;',
    'font-family:"IBM Plex Mono","Courier New",monospace;font-size:.82rem;letter-spacing:.08em;',
    'color:var(--fg,#111010);padding:.6rem .75rem;}',
    '#youth-gate .g-input::placeholder{color:var(--border,#d8d5cf);}',
    '#youth-gate .g-btn{background:none;border:none;border-left:1px solid var(--border,#d8d5cf);',
    'padding:.6rem .9rem;font-family:"IBM Plex Mono","Courier New",monospace;font-size:.75rem;',
    'letter-spacing:.06em;color:var(--muted,#888580);cursor:pointer;white-space:nowrap;transition:color .15s;}',
    '#youth-gate .g-btn:hover{color:var(--fg,#111010);}',
    '#youth-gate .g-err{font-size:.68rem;color:#7a3a2a;letter-spacing:.04em;min-height:1em;',
    'opacity:0;transition:opacity .2s;}',
    '#youth-gate .g-err.on{opacity:1;}',
    '@media(prefers-color-scheme:dark){#youth-gate{background:var(--bg,#0c0c0b);}',
    '#youth-gate .g-input{color:var(--fg,#e8e5df);}',
    '#youth-gate .g-err{color:#c07060;}}',
  ].join('');
  document.head.appendChild(style);

  /* — HTML del overlay — */
  function buildOverlay(onSuccess) {
    var el = document.createElement('div');
    el.id = 'youth-gate';
    el.innerHTML = [
      '<div class="g-inner">',
      '<span class="g-eye">YOUTH ARCHIVE</span>',
      '<p class="g-text">Esta página web ya no se encuentra disponible de forma pública.',
      ' Para acceder, ingresa la contraseña.<br><br>',
      'Puedes solicitarla en <span>youtharchivebysara@gmail.com</span>,',
      ' será concedida a discreción de la autora.</p>',
      '<hr>',
      '<div style="display:flex;flex-direction:column;gap:.75rem;">',
      '<label class="g-label" for="youth-pw">Contraseña</label>',
      '<div class="g-row">',
      '<input class="g-input" id="youth-pw" type="password" placeholder="···············" autocomplete="current-password">',
      '<button class="g-btn" id="youth-submit">entrar →</button>',
      '</div>',
      '<span class="g-err" id="youth-err">Contraseña incorrecta.</span>',
      '</div>',
      '</div>',
    ].join('');
    document.body.appendChild(el);

    var input = document.getElementById('youth-pw');
    var err   = document.getElementById('youth-err');
    var btn   = document.getElementById('youth-submit');

    function attempt() {
      if (check(input.value)) {
        setUnlock();
        onSuccess();
      } else {
        err.classList.add('on');
        input.focus();
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) {
      err.classList.remove('on');
      if (e.key === 'Enter') attempt();
    });
    setTimeout(function() { input.focus(); }, 50);
  }

  /* — lógica por tipo de página — */
  document.addEventListener('DOMContentLoaded', function () {
    if (!isIndex) {
      /* páginas internas: mostrar overlay y revelar contenido al desbloquear */
      var hideEl = document.getElementById('youth-gate-hide');
      if (hideEl) hideEl.remove(); // quitar el hide antes de mostrar el gate (el gate ya cubre todo)
      buildOverlay(function () {
        var overlay = document.getElementById('youth-gate');
        if (overlay) overlay.remove();
      });
      return;
    }

    /* índice: interceptar enlaces internos */
    document.addEventListener('click', function (e) {
      if (unlocked()) return;
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href === '#') return;
      if (/^\/?(?:index\.html)?$/.test(href)) return;
      e.preventDefault();
      var dest = href;
      buildOverlay(function () {
        var overlay = document.getElementById('youth-gate');
        if (overlay) overlay.remove();
        window.location.href = dest;
      });
    }, true);

    /* interceptar apertura del panel novedades */
    var summary = document.querySelector('#notif-panel > summary');
    if (summary) {
      summary.addEventListener('click', function (e) {
        if (unlocked()) return;
        var panel = document.getElementById('notif-panel');
        if (panel && !panel.open) {
          e.preventDefault();
          e.stopImmediatePropagation();
          buildOverlay(function () {
            var overlay = document.getElementById('youth-gate');
            if (overlay) overlay.remove();
            if (panel) panel.open = true;
          });
        }
      }, true);
    }
  });
})();
