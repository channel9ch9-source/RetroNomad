(function(){
 function norm(s){return String(s||"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim();}
 const PAL_MARKETS=new Set(["UK_EXACT","UK_SHARED_PAL","PAL_SHARED","UK_COMPATIBLE_EU_ENGLISH","UK_VISUAL_REQUIRED","PAL_EUROPE","EUROPEAN_ENGLISH_MATERIALS"]);
 const UK_STRONG=new Set(["UK_EXACT"]);
 const UK_SHARED=new Set(["UK_EXACT","UK_SHARED_PAL"]);
 const ORIGINAL_EDITIONS=new Set(["original","original / black label","original / not flagged"]);
 const BUDGET_EDITIONS=new Set(["platinum","budget","budget / reissue","greatest hits","essentials"]);
 const PROMO_EDITIONS=new Set(["demo","promo","demo / promo","promotional"]);

 function asBool(v){return v===true?true:v===false?false:null;}
 function lower(v){return String(v||"").toLowerCase();}
 function classificationOf(candidate){return candidate.classification||candidate.palScout||{};}
 function addUnique(arr,msg){if(msg&&!arr.includes(msg))arr.push(msg);}

 function gameCheck(target,c){
  if(!c.game)return{state:"review",reason:"Game identity is not confirmed."};
  return norm(c.game)===norm(target.game)?{state:"ok"}:{state:"filter",reason:"Different game."};
 }
 function platformCheck(target,c){
  if(!target.platform)return{state:"ok"};
  if(!c.platform)return{state:"review",reason:"Platform is not confirmed."};
  return c.platform===target.platform?{state:"ok"}:{state:"filter",reason:"Wrong platform."};
 }
 function compatibilityCheck(target,c){
  const state=lower(c.compatibility?.state||c.compatibilityState||c.compatibility);
  if(!state||state==="unknown"||state==="unconfirmed"||state==="review")return{state:"review",reason:"PAL/UK hardware compatibility is not confirmed."};
  if(state==="incompatible"||state==="not compatible"||state==="non-pal")return{state:"filter",reason:"Not compatible with the target UK/European PAL hardware."};
  return{state:"ok"};
 }
 function releaseCheck(target,c){
  const m=String(c.marketBucket||c.releaseMarket||"").toUpperCase();
  const pref=target.releasePreference;
  if(!m){
   return pref==="pal-compatible"||pref==="uk-preferred"
    ?{state:"review",reason:"Exact release market is not confirmed."}
    :{state:"review",reason:"Release evidence is not strong enough for this territory requirement."};
  }
  if(m==="NON_UK_EXACT"&&!PAL_MARKETS.has(m)){
   if(pref==="pal-compatible"||pref==="europe-pal")return{state:"review",reason:"This non-UK release still needs PAL compatibility evidence."};
   return{state:"filter",reason:"Release does not satisfy the UK-market requirement."};
  }
  if(pref==="uk-only")return UK_STRONG.has(m)?{state:"ok"}:{state:"filter",reason:"Not an exact UK release."};
  if(pref==="shared-pal"){
   if(UK_SHARED.has(m))return{state:"ok"};
   if(m==="PAL_SHARED")return{state:"review",reason:"Shared PAL release is not yet proven to include the UK market."};
   return{state:"filter",reason:"Release falls outside the UK/shared-PAL target."};
  }
  if(pref==="europe-pal")return PAL_MARKETS.has(m)?{state:"ok"}:{state:"review",reason:"European PAL release is not confirmed."};
  if(pref==="pal-compatible")return PAL_MARKETS.has(m)?{state:"ok"}:{state:"review",reason:"PAL-family release is not confirmed."};
  if(pref==="uk-preferred"){
   if(PAL_MARKETS.has(m))return{state:"ok"};
   return{state:"review",reason:"PAL-family release is not confirmed."};
  }
  return{state:"ok"};
 }
 function editionCheck(target,c){
  const pref=target.editionPreference;
  if(pref==="any")return{state:"ok"};
  const e=lower(c.edition);
  if(!e)return{state:"review",reason:"Edition is not confirmed."};
  if(PROMO_EDITIONS.has(e)||e.includes("demo")||e.includes("promo"))return{state:"filter",reason:"Demo/promo edition does not match the target."};
  if(pref==="original"){
   if(ORIGINAL_EDITIONS.has(e)||e.includes("original")||e.includes("black label"))return{state:"ok"};
   return{state:"filter",reason:"Target requires the original release."};
  }
  if(pref==="budget-ok"){
   if(ORIGINAL_EDITIONS.has(e)||BUDGET_EDITIONS.has(e)||e.includes("original")||e.includes("platinum")||e.includes("budget")||e.includes("reissue"))return{state:"ok"};
   return{state:"filter",reason:"Edition falls outside original/budget target."};
  }
  return{state:"ok"};
 }
 function completenessCheck(target,c){
  const pref=target.completeness;
  if(pref==="any")return{state:"ok"};
  const v=lower(c.completeness);
  if(!v||v==="unknown")return{state:"review",reason:"Completeness is not confirmed."};
  const complete=v==="complete"||v==="cib"||v.includes("complete");
  const noManual=v==="no_manual"||v==="missing manual"||v.includes("no manual");
  const discOnly=v==="disc_only"||v==="loose"||v.includes("disc only")||v.includes("loose");
  const caseOnly=v==="case_only"||v.includes("case only")||v.includes("artwork only");
  const incomplete=v==="incomplete"||v.includes("missing disc");
  if(pref==="cib")return complete?{state:"ok"}:{state:"filter",reason:"Target requires a complete-in-box copy."};
  if(pref==="manual-optional"){
   if(complete||noManual)return{state:"ok"};
   return{state:"filter",reason:"Target requires the game and case; loose/incomplete copies are excluded."};
  }
  if(pref==="loose-ok"){
   if(complete||noManual||discOnly)return{state:"ok"};
   if(caseOnly||incomplete)return{state:"filter",reason:"Listing does not contain a usable game copy."};
   return{state:"review",reason:"Completeness cannot be safely evaluated."};
  }
  return{state:"ok"};
 }
 function englishCheck(target,c){
  if(!target.englishRequired)return{state:"ok"};
  const v=asBool(c.englishFriendly);
  if(v===true)return{state:"ok"};
  if(v===false)return{state:"filter",reason:"English-friendly packaging/materials are required."};
  return{state:"review",reason:"English-friendly packaging/materials are not confirmed."};
 }
 function bundlePromoCheck(target,c){
  if(target.excludeBundles){
   const b=asBool(c.isBundle);
   if(b===true)return{state:"filter",reason:"Multi-game bundles are excluded."};
   if(b===null&&c.bundleStatus==="unknown")return{state:"review",reason:"Bundle status is not confirmed."};
  }
  if(target.excludePromo){
   const p=asBool(c.isPromo);
   const e=lower(c.edition);
   if(p===true||e.includes("demo")||e.includes("promo"))return{state:"filter",reason:"Demo/promo copies are excluded."};
  }
  return{state:"ok"};
 }
 function conditionCheck(target,c){
  if(target.condition==="any"){
   if(c.majorDamage===true)return{state:"filter",reason:"Listing has known major damage and is not treated as a usable copy."};
   return{state:"ok"};
  }
  if(target.condition==="no-major"){
   if(c.majorDamage===true)return{state:"filter",reason:"Target excludes major damage."};
   if(c.majorDamage===false)return{state:"ok"};
   return{state:"review",reason:"Major-damage status is not confirmed."};
  }
  if(target.condition==="collector"){
   if(c.collectorQuality===true)return{state:"ok"};
   if(c.majorDamage===true)return{state:"filter",reason:"Major damage conflicts with collector-quality preference."};
   return{state:"ok",soft:"Collector-quality is preferred but not confirmed."};
  }
  return{state:"ok"};
 }
 function priceCheck(target,candidate){
  if(!target.maxDeliveredGbp)return{state:"ok"};
  const gbp=Number(candidate.deliveredGbp);
  if(Number.isFinite(gbp)){
   return gbp<=target.maxDeliveredGbp?{state:"ok"}:{state:"filter",reason:"Delivered price is above the target ceiling."};
  }
  if(String(candidate.currency||"").toUpperCase()==="GBP"&&Number.isFinite(Number(candidate.total))){
   return Number(candidate.total)<=target.maxDeliveredGbp?{state:"ok"}:{state:"filter",reason:"Delivered price is above the target ceiling."};
  }
  return{state:"review",reason:"Delivered GBP price is not available, so the price ceiling cannot be checked."};
 }

 function rankPreference(target,c){
  let rank=0;
  const m=String(c.marketBucket||c.releaseMarket||"").toUpperCase();
  if(target.releasePreference==="uk-preferred"){
   if(m==="UK_EXACT")rank+=30;
   else if(m==="UK_SHARED_PAL")rank+=20;
   else if(m==="UK_COMPATIBLE_EU_ENGLISH")rank+=10;
   else if(PAL_MARKETS.has(m))rank+=5;
  }
  if(c.confidence==="High"||c.confidence==="high")rank+=12;
  if(c.englishFriendly===true)rank+=5;
  if(c.collectorQuality===true)rank+=4;
  return rank;
 }

 function evaluate(target,candidate){
  const c=classificationOf(candidate);
  const filtered=[],review=[],soft=[];
  const checks=[
   gameCheck(target,c),
   platformCheck(target,c),
   compatibilityCheck(target,c),
   releaseCheck(target,c),
   editionCheck(target,c),
   completenessCheck(target,c),
   englishCheck(target,c),
   bundlePromoCheck(target,c),
   conditionCheck(target,c),
   priceCheck(target,candidate)
  ];
  for(const x of checks){
   if(x.state==="filter")addUnique(filtered,x.reason);
   else if(x.state==="review")addUnique(review,x.reason);
   if(x.soft)addUnique(soft,x.soft);
  }
  const state=filtered.length?"FILTERED":review.length?"REVIEW":"MATCH";
  return{
   state,
   reasons:state==="FILTERED"?filtered:state==="REVIEW"?review:[],
   notes:soft,
   preferenceRank:rankPreference(target,c),
   deliveredGbp:Number.isFinite(Number(candidate.deliveredGbp))?Number(candidate.deliveredGbp):
    (String(candidate.currency||"").toUpperCase()==="GBP"&&Number.isFinite(Number(candidate.total))?Number(candidate.total):null)
  };
 }

 function sortEvaluated(rows){
  const stateOrder={MATCH:0,REVIEW:1,FILTERED:2};
  return [...rows].sort((a,b)=>{
   const sa=stateOrder[a.match?.state]??9,sb=stateOrder[b.match?.state]??9;
   if(sa!==sb)return sa-sb;
   const ra=a.match?.preferenceRank||0,rb=b.match?.preferenceRank||0;
   if(ra!==rb)return rb-ra;
   const pa=a.match?.deliveredGbp,pb=b.match?.deliveredGbp;
   if(pa!=null&&pb!=null&&pa!==pb)return pa-pb;
   return 0;
  });
 }

 window.RetroNomadMatcher={evaluate,sortEvaluated};
})();