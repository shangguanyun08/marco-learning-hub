(function(root){
  'use strict';
  const VERSION='focus-1119-v1',ink='#18364b',palette={blue:'#245b88',yellow:'#e9b94c',white:'#fff'};
  const colors=['blue','yellow','white'],shapes=['square','triangle','circle','diamond'];
  const clone=x=>JSON.parse(JSON.stringify(x)),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const token=(color,shape='square')=>({color,shape}),tokens=cs=>({kind:'tokens',tokens:cs.map(c=>typeof c==='string'?token(c):c)}),sectors=cs=>({kind:'sectors',colors:cs});
  const examples=tokens(colors);
  const specs=[
    {title:'Colour only',level:'easy',example:examples,input:tokens([token('yellow','triangle'),token('white','circle'),token('blue','diamond')]),rules:{blue:{color:'yellow'},yellow:{color:'yellow'},white:{color:'white'}},answer:2,explanation:'Blue becomes yellow. Yellow and white stay the same. Keep every shape and its position unchanged.'},
    {title:'Keep the sectors in place',level:'medium',example:sectors(['blue','yellow','white','blue']),input:sectors(['white','blue','yellow','white']),rules:{blue:{color:'yellow'},yellow:{color:'blue'},white:{color:'white'}},answer:4,explanation:'Blue becomes yellow, yellow becomes blue, and white stays white. Change the colours without turning the circle or moving a sector.'},
    {title:'A three-part code',example:examples,input:tokens(['white','yellow','blue']),rules:{blue:{color:'yellow'},yellow:{color:'blue',shape:'triangle'},white:{color:'white'}},answer:0,explanation:'Blue squares become yellow squares. Yellow squares become blue triangles. White squares stay white squares. Keep the order: white square, blue triangle, yellow square.'},
    {title:'Colour and shape together',example:examples,input:tokens(['yellow','white','blue']),rules:{blue:{color:'yellow',shape:'circle'},yellow:{color:'blue',shape:'diamond'},white:{color:'white'}},answer:3,explanation:'Blue squares become yellow circles. Yellow squares become blue diamonds. White squares stay unchanged. Apply both the colour and shape changes at each position.'},
    {title:'Two different kinds of change',example:examples,input:tokens(['white','blue','yellow','blue']),rules:{blue:{color:'yellow'},yellow:{color:'yellow',shape:'triangle'},white:{color:'white'}},answer:1,explanation:'Blue changes colour to yellow but keeps its square shape. Yellow keeps its colour but becomes a triangle. White stays unchanged. Use each starting colour’s own rule, including both blue squares.'},
    {title:'Spot the unchanged parts',example:examples,input:tokens(['yellow','white','yellow','blue']),rules:{blue:{color:'blue'},yellow:{color:'yellow',shape:'triangle'},white:{color:'blue'}},answer:4,explanation:'Blue squares stay unchanged. White squares become blue squares. Yellow squares become yellow triangles. White changes in this example: follow the current example rather than an earlier question’s rule.'},
    {title:'Check every position',example:examples,input:tokens(['blue','white','yellow','white']),rules:{blue:{color:'yellow',shape:'triangle'},yellow:{color:'yellow'},white:{color:'blue',shape:'circle'}},answer:2,explanation:'Blue squares become yellow triangles. White squares become blue circles. Yellow squares stay unchanged. The two white squares must both change, while the yellow square keeps its colour and shape.'},
    {title:'Three starting colours',example:sectors(['white','yellow','blue','yellow']),input:sectors(['yellow','yellow','white','blue']),rules:{blue:{color:'yellow'},yellow:{color:'blue'},white:{color:'yellow'}},answer:0,explanation:'Starting yellow becomes blue. Starting blue and white both become yellow. Keep each sector in its original place. Do not reverse the blue and yellow result.'},
    {title:'Use every part of the rule',example:sectors(['blue','yellow','white','blue']),input:sectors(['yellow','white','blue','yellow']),rules:{blue:{color:'white'},yellow:{color:'blue'},white:{color:'white'}},answer:3,explanation:'Blue becomes white. Yellow becomes blue. White stays white. Check all four sectors; the sector that was already white must not change.'},
    {title:'Only some parts change',example:sectors(['blue','white','yellow','blue']),input:sectors(['white','blue','yellow','white']),rules:{blue:{color:'yellow'},yellow:{color:'yellow'},white:{color:'white'}},answer:1,explanation:'Only starting blue changes: it becomes yellow. Starting yellow and white stay unchanged. Keep all sector positions fixed.'},
    {title:'A fresh colour code',example:sectors(['white','yellow','blue','white']),input:sectors(['yellow','white','blue','yellow']),rules:{blue:{color:'blue'},yellow:{color:'yellow'},white:{color:'blue'}},answer:4,explanation:'White becomes blue. Starting blue and yellow stay unchanged. This rule changes white, so do not assume that white always stays white.'},
    {title:'Three-way colour cycle',example:sectors(['blue','yellow','white','blue']),input:sectors(['white','blue','yellow','yellow']),rules:{blue:{color:'white'},yellow:{color:'blue'},white:{color:'yellow'}},answer:2,explanation:'Blue becomes white, yellow becomes blue, and white becomes yellow. Apply the rule to each original colour once. Do not apply a second change to the newly coloured sectors.'}
  ];
  function transform(model,rules){
    if(model.kind==='sectors')return sectors(model.colors.map(c=>rules[c].color));
    return {kind:'tokens',tokens:model.tokens.map(t=>({...t,...rules[t.color]}))};
  }
  function options(input,correct,answer){
    const candidates=[],add=m=>candidates.push(clone(m));add(input);
    if(correct.kind==='tokens'){
      const unchanged=correct.tokens.findIndex((t,i)=>JSON.stringify(t)===JSON.stringify(input.tokens[i]));
      const changed=clone(correct),i=unchanged<0?0:unchanged;changed.tokens[i].shape=shapes[(shapes.indexOf(changed.tokens[i].shape)+1)%shapes.length];add(changed);
      const recolored=clone(correct);recolored.tokens[0].color=colors[(colors.indexOf(recolored.tokens[0].color)+1)%3];add(recolored);
      add({kind:'tokens',tokens:correct.tokens.slice().reverse()});
      add({kind:'tokens',tokens:correct.tokens.map(t=>({...t,shape:t.shape==='triangle'?'square':'triangle'}))});
      add({kind:'tokens',tokens:correct.tokens.slice(1).concat(correct.tokens[0])});
      correct.tokens.forEach((t,i)=>colors.forEach(color=>{const m=clone(correct);m.tokens[i].color=color;add(m);}));
    }else{
      add(sectors(correct.colors.map(c=>c==='blue'?'yellow':c==='yellow'?'blue':c)));
      add(sectors(correct.colors.slice(1).concat(correct.colors[0])));
      add(sectors(correct.colors.slice(2).concat(correct.colors.slice(0,2))));
      correct.colors.forEach((_c,i)=>colors.forEach(color=>{const m=clone(correct);m.colors[i]=color;add(m);}));
    }
    const seen=new Set([JSON.stringify(correct)]),wrong=[];
    for(const candidate of candidates){const key=JSON.stringify(candidate);if(!seen.has(key)){seen.add(key);wrong.push(candidate);}if(wrong.length===4)break;}
    if(wrong.length!==4)throw Error('Insufficient distinct focus choices');
    wrong.splice(answer,0,clone(correct));return wrong;
  }
  const rect=(x,y,w,h,fill='#fff',stroke='#b8cad3')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  function drawToken(t,cx,cy,size){
    const fill=palette[t.color],half=size/2,attrs=`fill="${fill}" stroke="${ink}" stroke-width="2"`;
    if(t.shape==='circle')return `<circle cx="${cx}" cy="${cy}" r="${half}" ${attrs}/>`;
    if(t.shape==='triangle')return `<polygon points="${cx},${cy-half} ${cx+half},${cy+half} ${cx-half},${cy+half}" ${attrs}/>`;
    if(t.shape==='diamond')return `<polygon points="${cx},${cy-half} ${cx+half},${cy} ${cx},${cy+half} ${cx-half},${cy}" ${attrs}/>`;
    return `<rect x="${cx-half}" y="${cy-half}" width="${size}" height="${size}" ${attrs}/>`;
  }
  function draw(model){
    let body=rect(2,2,276,108);
    if(model.kind==='tokens')model.tokens.forEach((t,i)=>{body+=drawToken(t,20+(i+.5)*240/model.tokens.length,56,Math.min(48,170/model.tokens.length));});
    else model.colors.forEach((color,i)=>{body+=`<path d="M140 56L140 12A44 44 0 0 1 184 56Z" fill="${palette[color]}" stroke="${ink}" stroke-width="2" transform="rotate(${i*90} 140 56)"/>`;});
    return body;
  }
  const svg=(body,w,h)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="white"/>${body}</svg>`,uri=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
  const text=(s,x,y,size=18,anchor='middle')=>`<text x="${x}" y="${y}" fill="${ink}" text-anchor="${anchor}" font-size="${size}" font-family="system-ui,sans-serif">${esc(s)}</text>`;
  const at=(body,x,y)=>`<g transform="translate(${x} ${y})">${body}</g>`;
  function diagram(spec){
    const prompt=spec.input.kind==='sectors'?'Use the same colour rule. Keep each sector in place.':spec.level?'Use the same colour rule. Keep shapes and positions.':'Use each starting colour’s rule. Keep every position.';
    return svg(text(prompt,360,24)+text('Example',20,53,18,'start')+at(draw(spec.example),20,66)+at(draw(transform(spec.example,spec.rules)),420,66)+text('→',360,132,32)+text('Your turn',20,211,18,'start')+at(draw(spec.input),20,224)+at(rect(2,2,276,108,'#f1f5f7',ink)+text('?',140,74,48),420,224)+text('→',360,290,32),720,350);
  }
  const questions=specs.map((spec,i)=>{
    const correct=transform(spec.input,spec.rules),choices=options(spec.input,correct,spec.answer),kind=spec.input.kind;
    return {id:'focus-1119-'+String(i+1).padStart(2,'0'),type:'analogy',level:spec.level||'challenge',sourceId:kind==='tokens'?'analogy-19':'analogy-23',variantVersion:VERSION,title:spec.title,rule:kind==='tokens'?'Conditional colour-and-shape code':'Colour substitution with fixed positions',skillCode:kind==='tokens'?'conditional-code':'sector-colour-code',answer:spec.answer,explanation:spec.explanation,numberedOptions:false,figures:[uri(diagram(spec)),...choices.map(m=>uri(svg(draw(m),280,112)))],choiceModels:choices};
  });
  const api={VERSION,get:id=>questions.find(q=>q.id===id)||null};
  if(typeof module!=='undefined')module.exports=api;else root.NNATFocus=api;
})(typeof window==='undefined'?{}:window);
