(function(){
 const providers=new Map();

 function normaliseMoney(value){
  const n=Number(value);
  return Number.isFinite(n)&&n>=0?n:null;
 }

 function normaliseListing(source,raw){
  const itemPrice=normaliseMoney(raw.itemPrice);
  const postage=normaliseMoney(raw.postage);
  const total=itemPrice!=null&&postage!=null?itemPrice+postage:(raw.total!=null?normaliseMoney(raw.total):null);
  return {
   source:String(source||raw.source||"unknown"),
   externalId:String(raw.externalId||""),
   canonicalUrl:String(raw.canonicalUrl||raw.url||""),
   title:String(raw.title||""),
   description:String(raw.description||""),
   imageUrl:String(raw.imageUrl||""),
   currency:String(raw.currency||"").toUpperCase(),
   itemPrice,
   postage,
   total,
   seller:String(raw.seller||""),
   listedAt:raw.listedAt||null,
   fetchedAt:raw.fetchedAt||new Date().toISOString(),
   sourceRegion:String(raw.sourceRegion||""),
   conditionText:String(raw.conditionText||raw.condition||""),
   itemSpecifics:(raw.itemSpecifics&&typeof raw.itemSpecifics==="object")?raw.itemSpecifics:{},
   identifiers:Array.isArray(raw.identifiers)?raw.identifiers.map(String):[],
   englishFriendly:raw.englishFriendly===true?true:raw.englishFriendly===false?false:null,
   ocrText:String(raw.ocrText||""),
   raw:raw.raw||null
  };
 }

 function validateListing(x){
  const errors=[];
  if(!x.source)errors.push("source");
  if(!x.externalId)errors.push("externalId");
  if(!x.canonicalUrl)errors.push("canonicalUrl");
  if(!x.title)errors.push("title");
  if(!x.currency)errors.push("currency");
  return{ok:errors.length===0,missing:errors};
 }

 function registerProvider(name,adapter){
  if(!name||!adapter||typeof adapter.search!=="function")throw new Error("Provider adapter must expose search(target)");
  providers.set(name,adapter);
 }

 function unregisterProvider(name){providers.delete(name);}
 function providerNames(){return[...providers.keys()];}

 async function search(target){
  const jobs=[...providers.entries()].map(async([name,adapter])=>{
   try{
    const rows=await adapter.search(target);
    return(rows||[]).map(r=>normaliseListing(name,r));
   }catch(error){
    return[];
   }
  });
  return(await Promise.all(jobs)).flat();
 }

 window.RetroNomadMarketplace={
  registerProvider,unregisterProvider,providerNames,search,normaliseListing,validateListing
 };
})();