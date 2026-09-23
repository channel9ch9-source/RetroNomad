// Browser adapter for the shared RetroNomad matcher core.
// Exposes the historical window.RetroNomadMatcher API used by search-pipeline.js.
(function(){
 window.RetroNomadMatcherReady=import("./shared/search-matcher-core.js").then(({createSearchMatcher})=>{
  window.RetroNomadMatcher=createSearchMatcher();
  return window.RetroNomadMatcher;
 });
})();