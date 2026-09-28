(function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=(body,label,w=600,h=330)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#173957" stroke-width="2">${body}</g></svg>`;
  const txt=(x,y,t,size=17)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#173957" stroke="none" font-size="${size}" font-family="system-ui,sans-serif">${esc(t)}</text>`;
  function block(d){const [w,depth,h]=d,u=28,v=13,x=35,y=depth*v+25,front=w*u,high=h*u;
    let s=`<path fill="#eef4fb" d="M${x} ${y}h${front}v${high}H${x}z"/><path fill="#d7e4f3" d="M${x} ${y}l${depth*v} -${depth*v}h${front}l-${depth*v} ${depth*v}z"/><path fill="#acc7e6" d="M${x+front} ${y}l${depth*v} -${depth*v}v${high}l-${depth*v} ${depth*v}z"/>`;
    for(let i=1;i<w;i++)s+=`<path d="M${x+i*u} ${y+high}V${y}l${depth*v} -${depth*v}"/>`;
    for(let i=1;i<h;i++)s+=`<path d="M${x} ${y+i*u}h${front}l${depth*v} -${depth*v}"/>`;
    for(let i=1;i<depth;i++)s+=`<path d="M${x+i*v} ${y-i*v}h${front}v${high}"/>`;
    return svg(s,`Block ${w} by ${depth} by ${h} unit cubes`,front+depth*v+75,high+depth*v+55);
  }
  function chart(d){const max=Math.max(...d.values),top=45,bottom=255,bar=400/d.values.length;
    let s=txt(300,24,d.title,18)+`<path d="M70 ${top}V${bottom}H540"/>`;
    for(let i=0;i<=5;i++){let val=Math.ceil(max/5)*i,y=bottom-val/(Math.ceil(max/5)*5)*200;s+=`<path stroke="#d7dfe7" d="M70 ${y}H540"/>`+txt(48,y+6,val,14);}
    d.values.forEach((n,i)=>{const x=92+i*bar,h=n/(Math.ceil(max/5)*5)*200;s+=`<rect x="${x}" y="${bottom-h}" width="${bar*.68}" height="${h}" fill="#719dcc"/>`+txt(x+bar*.34,bottom-h-7,n,15)+txt(x+bar*.34,280,d.labels[i],14);});
    return svg(s,d.title+'. '+d.labels.map((l,i)=>`${l}: ${d.values[i]}`).join(', '),600,300);
  }
  function spinner(){let s='';for(let i=0;i<8;i++){const a=(i*45-90)*Math.PI/180,b=a+Math.PI/4,c=(a+b)/2; s+=`<path fill="${i%2===0?'#b3cbe5':'#fff'}" d="M150 150L${150+120*Math.cos(a)} ${150+120*Math.sin(a)}A120 120 0 0 1 ${150+120*Math.cos(b)} ${150+120*Math.sin(b)}Z"/>`+txt(150+83*Math.cos(c),157+83*Math.sin(c),i+1,23);}return svg(s,'Eight equal sectors numbered 1 to 8; odd numbers shaded.',300,300);}
  function diagram(d){if(d.type==='cuboid')return block(d.dims);if(d.type==='bars')return chart(d);if(d.type==='spinner')return spinner();
    if(d.type==='table')return `<table class="math-table"><thead><tr>${d.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${d.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    if(d.type==='triangle')return svg(`<path d="M150 35V265H325Z"/>${d.right?'<path d="M150 242H173V265"/>':''}${txt(125,150,'x',24)}${txt(238,294,d.base,24)}${txt(262,143,d.side,24)}${txt(420,300,'Not to scale',14)}`,'Triangle with sides x, '+d.base+', '+d.side+(d.right?'; marked right angle.':'; no angles specified.'),520,325);
    if(d.type==='area'){const u=13,x=90,y=38,a=x+d.step*u,b=a+d.bottom*u,r=x+d.top*u,bar=y+d.bar*u,low=y+(d.lower+d.bar)*u,left=y+d.left*u;
      return svg(`<path fill="#eef4fb" d="M${x} ${y}H${r}V${bar}H${b}V${low}H${a}V${left}H${x}Z"/>${txt((x+r)/2,y-12,d.top+' cm')}${txt(x-36,(y+left)/2,d.left+' cm')}${txt((x+a)/2,left+24,d.step+' cm')}${txt((a+b)/2,low+26,d.bottom+' cm')}${txt(b+42,(bar+low)/2,d.lower+' cm')}${txt(r+38,(y+bar)/2+6,d.bar+' cm')}${txt(r+20,low+26,'Not to scale',12)}`,'Stepped polygon: top '+d.top+', left height '+d.left+', left step '+d.step+', bottom '+d.bottom+', lower right height '+d.lower+', top bar thickness '+d.bar+' centimeters.',r+110,low+50);}
    return '';
  }
  function visual(q){return (q.image?`<figure class="diagram source-diagram"><img src="./assets/${esc(q.image)}" alt="${esc(q.alt)}"></figure>`:q.diagram?`<figure class="diagram">${diagram(q.diagram)}</figure>`:'')+(q.columns?`<div class="comparison"><div><b>Column A</b><p>${esc(q.columns[0])}</p></div><div><b>Column B</b><p>${esc(q.columns[1])}</p></div></div>`:'');}
  window.MarcoReviewVisuals={esc,visual,choiceVisual:(q,i)=>q.choiceBlocks?block(q.choiceBlocks[i]):''};
})();
