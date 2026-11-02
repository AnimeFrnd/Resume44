/* Resume44 Android shim.
   Copied into www/ at build time only (the original site files are never edited).
   js/app.js saves PDFs through window.Capacitor.Plugins.Filesystem / .Share.
   This site has no bundler, so make sure those two native plugins are reachable. */
(function () {
  var C = window.Capacitor;
  if (!C) return;
  var isNative = typeof C.isNativePlatform === 'function' ? C.isNativePlatform() : false;
  if (!isNative) return;
  C.Plugins = C.Plugins || {};
  ['Filesystem', 'Share', 'App', 'StatusBar'].forEach(function (name) {
    try {
      if (C.Plugins[name]) return;
      if (typeof C.registerPlugin === 'function') {
        C.Plugins[name] = C.registerPlugin(name);
      } else if (typeof C.nativePromise === 'function' && typeof Proxy === 'function') {
        C.Plugins[name] = new Proxy({}, {
          get: function (_, method) {
            if (method === 'then') return undefined;
            return function (options) { return C.nativePromise(name, String(method), options || {}); };
          }
        });
      }
    } catch (e) { console.warn('Resume44 shim: could not register ' + name, e); }
  });
})();
