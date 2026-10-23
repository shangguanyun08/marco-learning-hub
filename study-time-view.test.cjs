const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom'),{sessions}=require('./study-time-model.js');
const p=(start,end,seconds,appId='review5')=>({appId,courseName:'Math Review 5',subject:'math',startedAt:`2026-10-23T${start}Z`,endedAt:`2026-10-23T${end}Z`,seconds,source:'active'});
test('fragmented session shows elapsed window without inflating captured time or spanning long breaks',()=>{
 const rows=sessions([p('00:27:52','00:30:00',30),p('00:35:00','00:40:00',30),p('00:49:00','00:55:00',30),p('01:04:00','01:08:52',30),p('02:18:00','02:18:02',2)]);
 assert.equal(rows.length,2);assert.equal(rows[0].elapsedSeconds,2460);assert.equal(rows[0].capturedSeconds,120);assert.equal(rows[1].elapsedSeconds,2);
});
test('time page warns about incomplete totals and displays the observed Pacific-time window',async t=>{
 const dom=new JSDOM(fs.readFileSync('study-time.html','utf8'),{url:'https://example.test/study-time.html?date=2026-10-22',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());
 const stats={seconds:120,mathSeconds:120,hasTimeRecord:true,periods:[p('00:27:52','00:30:00',30),p('00:35:00','00:40:00',30),p('00:49:00','00:55:00',30),p('01:04:00','01:08:52',30)]};
 w.fetch=async()=>({ok:true,json:async()=>({day:{date:'2026-10-22',students:{Marco:stats},recordedWork:[]},history:[]})});
 w.eval(fs.readFileSync('study-time-model.js','utf8'));w.eval(fs.readFileSync('study-time.js','utf8'));await new Promise(r=>setTimeout(r,20));
 assert.equal(w.document.getElementById('total-time').textContent,'2 min');assert.match(w.document.getElementById('time-coverage').textContent,/incomplete/);assert.match(w.document.getElementById('study-sessions').textContent,/5:27 PM–6:08 PM/);assert.match(w.document.getElementById('study-sessions').textContent,/41 min elapsed window/);assert.match(w.document.getElementById('study-sessions').textContent,/Answer timestamps are not available online/);
});
