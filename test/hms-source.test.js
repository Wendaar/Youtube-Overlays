import test from 'node:test';
import assert from 'node:assert/strict';
import {apiGame,parseGameInput,viewUrl} from '../hms-source.js';
const id='6C02DF50-CE27-11F1-A5F0-6320901B5AD5';
test('HMS links choose their own organization and validate UUIDs, never first-game fallback',()=>{
  assert.deepEqual(parseGameInput(`https://prod.hms.wootera.net/org/euchl/games/${id}`),{org:'EUCHL',gameId:id});
  assert.deepEqual(parseGameInput(` ${id} `,'EUCHL'),{org:'EUCHL',gameId:id});
  for(const value of ['invalid','https://evil.test/org/euchl/games/'+id,id+'?x=1','https://user:pass@prod.hms.wootera.net/org/euchl/games/'+id])assert.throws(()=>parseGameInput(value));
});
test('OBS URLs retain source, org and game independently of date selection',()=>{
  const url=new URL(viewUrl('https://example.com/broadcast/index.html?filter=Tomorrow',{org:'EUCHL',gameId:id}));
  assert.equal(url.pathname,'/broadcast/index.html');assert.equal(url.searchParams.get('mode'),'overlay');assert.equal(url.searchParams.get('org'),'EUCHL');assert.equal(url.searchParams.get('game'),id);assert.equal(url.searchParams.get('source'),'hms');assert.equal(url.searchParams.has('filter'),false);
});
test('HMS model keeps supplied local date/time and IDs, rejects mismatched orgs and unsafe images',()=>{
  const input={schemaVersion:1,org:'EUCHL',gameId:id,date:'2026-10-23',time:'21:15',home:{name:'Prague Guardians',logoUrl:'javascript:alert(1)'},away:{name:'Bratislava Capitals'},referee:null,timekeeper:null};
  const game=apiGame(input,'EUCHL',id);assert.equal(game.Date,'23. 10. 2026');assert.equal(game.Time,'21:15');assert.equal(game.Referee,'');assert.equal(game.homeLogo,null);assert.equal(game.warnings.length,3);
  assert.throws(()=>apiGame({...input,org:'PHM'},'EUCHL',id));assert.throws(()=>apiGame({...input,gameId:'bad'},'EUCHL',id));
});
