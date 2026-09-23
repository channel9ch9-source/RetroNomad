(function(){
 async function run(target){
  if(!window.RetroNomadMarketplace)throw new Error("Marketplace source layer is unavailable");
  if(window.PALScoutClassifierReady)await window.PALScoutClassifierReady;
  if(window.RetroNomadMatcherReady)await window.RetroNomadMatcherReady;
  if(!window.PALScoutClassifier)throw new Error("PALScout classifier is unavailable");
  if(!window.RetroNomadMatcher)throw new Error("Search matcher is unavailable");

  const raw=await window.RetroNomadMarketplace.search(target);
  const rows=raw.map(listing=>{
   const classified=window.PALScoutClassifier.classifyMarketplaceListing(listing,{platform:target.platform||""});
   const match=window.RetroNomadMatcher.evaluate(target,classified);
   return{...classified,match};
  });
  return window.RetroNomadMatcher.sortEvaluated(rows);
 }

 function summarize(rows){
  const counts={MATCH:0,REVIEW:0,FILTERED:0};
  for(const r of rows||[]){const s=r.match?.state;if(counts[s]!=null)counts[s]++;}
  return{total:(rows||[]).length,...counts};
 }

 window.RetroNomadSearchPipeline={run,summarize};
})();