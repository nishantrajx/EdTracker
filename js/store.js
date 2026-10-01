// Pure merge: newest timestamp wins per item (profile, each tick, each exam date).
function merge(a,b){const o={profile:a.profile,ticks:{},exam:{}};
 if(b.profile&&(!a.profile||b.profile.t>a.profile.t))o.profile=b.profile;
 for(const k of['ticks','exam']){const x=a[k]||{},y=b[k]||{};o[k]={...x};for(const i in y)if(!x[i]||y[i].t>x[i].t)o[k][i]=y[i];}
 return o}
if(typeof module!='undefined')module.exports={merge};
