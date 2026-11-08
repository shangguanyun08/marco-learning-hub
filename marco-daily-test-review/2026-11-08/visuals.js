(function(root){
 'use strict';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function plot(g,id,label){
  const x=v=>130+v*12.5,y=v=>130-v*12.5,clip='plot-'+id;
  let s=`<svg class="line-plot" viewBox="0 0 260 260" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><defs><clipPath id="${clip}"><rect x="30" y="30" width="200" height="200"/></clipPath></defs><rect x="30" y="30" width="200" height="200" fill="white"/>`;
  for(let t=-8;t<=8;t++){s+=`<path d="M${x(t)} 30V230M30 ${y(t)}H230" stroke="#dce4ea" fill="none"/>`;if(t&&t%2===0)s+=`<text x="${x(t)}" y="143" text-anchor="middle" font-size="10">${t}</text><text x="121" y="${y(t)+3}" text-anchor="end" font-size="10">${t}</text>`;}
  return s+`<path d="M24 130H237M130 237V23" stroke="#26485b" stroke-width="1.5" fill="none"/><path d="M24 130l5 -3v6zM237 130l-5 -3v6zM130 23l-3 5h6zM130 237l-3 -5h6z" fill="#26485b"/><text x="241" y="134">x</text><text x="134" y="20">y</text><path d="M${x(-8)} ${y(-8*g.m+g.b)}L${x(8)} ${y(8*g.m+g.b)}" clip-path="url(#${clip})" stroke="#173957" stroke-width="2.7" fill="none"/></svg>`;
 }
 function diagram(d){
  let s='',label='',caption='Not drawn to scale.';
  if(d.kind==='triangle'){
   const pts=d.points,c=[pts.reduce((n,p)=>n+p[0],0)/3,pts.reduce((n,p)=>n+p[1],0)/3];
   label='Triangle '+d.labels.join('')+'. '+d.labels.map((l,i)=>d.angles[i]?`Angle ${l}: ${d.angles[i]}.`:'').join(' ');
   if(d.ticks.length)label+=' Sides '+d.ticks.map(([a,b])=>d.labels[a]+d.labels[b]).join(' and ')+' are marked equal.';
   if(d.extension)label+=' Exterior angle '+d.extension.label+'.';
   s=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="white" stroke="#173957" stroke-width="2.5"/>`;
   pts.forEach((p,i)=>{const dx=p[0]-c[0],dy=p[1]-c[1],len=Math.hypot(dx,dy);s+=`<text x="${p[0]+dx/len*19}" y="${p[1]+dy/len*19+5}" text-anchor="middle" font-size="18">${esc(d.labels[i])}</text>`;if(d.angles[i])s+=`<text x="${p[0]-dx/len*35}" y="${p[1]-dy/len*35+5}" text-anchor="middle" font-size="17">${esc(d.angles[i])}</text>`;});
   for(const[a,b]of d.ticks){const p=pts[a],q=pts[b],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy),nx=-dy/len*9,ny=dx/len*9;s+=`<path d="M${mx-nx} ${my-ny}L${mx+nx} ${my+ny}" stroke="#173957" stroke-width="2.5"/>`;}
   if(d.extension){const e=d.extension;s+=`<path d="M${e.from.join(' ')}L${e.to.join(' ')}" stroke="#173957" stroke-width="2.5"/><text x="${e.text[0]}" y="${e.text[1]}" font-size="16">${esc(e.label)}</text>`;}
  }else if(d.kind==='grid'){
   const unit=Math.min(65,260/d.cols),w=unit*d.cols,h=unit*d.rows,ox=(320-w)/2,oy=(300-h)/2;
   label=`${d.cols===d.rows?'Square':'Rectangle'} divided into ${d.rows} rows and ${d.cols} columns. Shaded cells: ${d.shaded.map(([r,c])=>`row ${r+1} column ${c+1}`).join('; ')}.`;caption='Shading is part of the figure.';
   for(let r=0;r<d.rows;r++)for(let c=0;c<d.cols;c++)s+=`<rect x="${ox+c*unit}" y="${oy+r*unit}" width="${unit}" height="${unit}" fill="${d.shaded.some(p=>p[0]===r&&p[1]===c)?'#8f969c':'#fff'}" stroke="#173957" stroke-width="2"/>`;
  }else if(d.kind==='hexagon'){
   const pts=Array.from({length:6},(_,i)=>{const a=(-120+i*60)*Math.PI/180;return[160+120*Math.cos(a),150+120*Math.sin(a)];});
   label='Regular hexagon divided into six triangles. Only the top triangle is white; the other five triangles are gray.';caption='Shading is part of the figure.';
   for(let i=0;i<6;i++)s+=`<polygon points="160,150 ${pts[i].join(',')} ${pts[(i+1)%6].join(',')}" fill="${d.white.includes(i)?'#fff':'#8f969c'}" stroke="#173957" stroke-width="2"/>`;
  }
  return `<figure class="practice-diagram"><svg viewBox="0 0 320 300" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${s}</svg><figcaption>${caption}</figcaption></figure>`;
 }
 root.MarcoMA5Visuals={plot,diagram};
})(typeof window==='undefined'?globalThis:window);
