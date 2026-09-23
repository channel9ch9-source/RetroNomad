// Browser adapter for the shared PALScout core.
// Exposes the historical window.PALScoutClassifier API used by search-pipeline.js.
(function(){
 window.PALScoutClassifierReady=import("./shared/palscout-core.js").then(({createPALScoutClassifier})=>{
  window.PALScoutClassifier=createPALScoutClassifier(window.RELEASE_EVIDENCE||[]);
  return window.PALScoutClassifier;
 });
})();