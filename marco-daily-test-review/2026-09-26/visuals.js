(function(root){
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=(label,body,w=600,h=260)=>`<svg class="math-diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><g font-family="system-ui,sans-serif" font-size="18" fill="#193c49">${body}</g></svg>`;
  const line=(x1,y1,x2,y2,color='#193c49')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"/>`;
  const label=(x,y,s,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`;
  function visual(q){
    const v=q.visual;if(!v)return '';
    if(v.kind==='table')return `<div class="table-scroll"><table class="math-table"><thead><tr>${v.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${v.rows.map(row=>`<tr>${row.map((cell,i)=>i?`<td>${esc(cell)}</td>`:`<th scope="row">${esc(cell)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if(v.kind==='originalBlocks')return '<figure><img class="source-diagram" src="./assets/original-blocks.png" alt="Three cubes in a horizontal front row, with one extra cube behind the rightmost cube. Arrows identify front, side and top views."></figure>';
    if(v.kind==='bars'){
      const max=Math.ceil(Math.max(...v.values)/10)*10,step=max<=80?10:20,dx=500/v.labels.length;
      let body=label(320,23,v.unit);
      for(let n=0;n<=max;n+=step){const y=230-n/max*170;body+=line(60,y,570,y,'#d9e4e4')+label(49,y+6,n,'end');}
      body+=line(60,45,60,230)+line(60,230,570,230);
      v.values.forEach((value,i)=>{const x=70+i*dx,h=value/max*170;body+=`<rect x="${x}" y="${230-h}" width="${dx*.63}" height="${h}" fill="#64acb3" stroke="#193c49"/>`+label(x+dx*.315,260,v.labels[i]);});
      return `<figure>${svg('Bar chart: '+v.labels.map((name,i)=>name+' '+v.values[i]).join(', ')+'. '+v.unit,body,600,290)}</figure>`;
    }
    if(v.kind==='polygons'){
      let body='';v.sides.forEach((n,i)=>{const cx=100+i*170,cy=90,r=58,pts=Array.from({length:n},(_,j)=>{const a=-Math.PI/2+j*2*Math.PI/n;return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;}).join(' ');body+=`<polygon points="${pts}" fill="#edf5f1" stroke="#236b54" stroke-width="3"/>`;if(i<2)body+=label(cx+85,97,'→');});body+=label(570,97,'?');
      return svg('Sequence of polygons with '+v.sides.join(', ')+' sides, followed by a question mark.',body,620,180);
    }
    if(v.kind==='numberline'){
      const x=n=>300+n*105;let body=line(35,90,565,90)+`<path d="M555 84L565 90L555 96" fill="none" stroke="#193c49" stroke-width="2"/>`;
      for(let n=-2;n<=2;n++){body+=line(x(n),83,x(n),97)+label(x(n),123,n);}
      for(const [name,value] of [['a',v.a],['b',v.b]])body+=`<circle cx="${x(value)}" cy="90" r="5" fill="#236b54"/>`+label(x(value),66,name);
      return svg(`Number line with a at ${v.a} and b at ${v.b}.`,body,600,160);
    }
    if(v.kind==='midpoint'){
      let body=line(60,80,540,80);for(const [name,x] of [['A',60],['D',210],['C',360],['B',540]])body+=line(x,72,x,88)+label(x,115,name);
      body+=label(135,59,'=')+label(285,59,'=')+label(445,59,`CB = ${v.cb} cm`)+label(370,152,`DB = ${v.db} cm`);
      return svg('Collinear points A, D, C, B in that order; AD equals DC. Diagram not to scale.',body,600,180)+'<p class="diagram-note">Diagram not to scale.</p>';
    }
    if(v.kind==='angles'){
      const ox=290,oy=215,r=160,c=180-v.angle,m=180-v.angle/2,n=m-90;
      const point=(deg,len=r)=>[ox+len*Math.cos(deg*Math.PI/180),oy-len*Math.sin(deg*Math.PI/180)];
      let body='';for(const [name,deg] of [['A',180],['B',0],['C',c],['D',c+180],['M',m],['N',n]]){const [x,y]=point(deg,name==='D'?54:r),[tx,ty]=point(deg,name==='D'?74:r+22);body+=line(ox,oy,x,y,name==='M'||name==='N'?'#236b54':'#193c49')+label(tx,ty+5,name);}
      const u=point(m,24),w=point(n,24),corner=[u[0]+w[0]-ox,u[1]+w[1]-oy];body+=`<path d="M${u}L${corner}L${w}" fill="none" stroke="#236b54" stroke-width="2"/>`+label(ox-10,oy+25,'O');
      body+=label(95,270,`∠AOC = ${v.angle}°`)+label(435,270,'OM ⟂ ON');
      return svg('AB and CD intersect at O. OM bisects AOC; ON is perpendicular to OM, with OC between OM and ON.',body,600,310)+'<p class="diagram-note">Diagram not to scale.</p>';
    }
    if(v.kind==='cyclic'){
      const pts={};for(const [name,angle]of [['A',140],['B',15],['C',-45],['D',-105]])pts[name]=[260+106*Math.cos(angle*Math.PI/180),130+106*Math.sin(angle*Math.PI/180)];pts.E=[pts.C[0]+.9*(pts.C[0]-pts.D[0]),pts.C[1]+.9*(pts.C[1]-pts.D[1])];let body='<circle cx="260" cy="130" r="106" fill="none" stroke="#193c49" stroke-width="2"/>';
      body+=`<polygon points="${['A','B','C','D'].map(k=>pts[k].join(',')).join(' ')}" fill="none" stroke="#193c49" stroke-width="2"/>`+line(...pts.D,...pts.E);
      for(const [name,[x,y]] of Object.entries(pts))body+=label(x+(name==='B'?15:0),y+(name==='A'?24:-10),name);
      body+=label(220,196,`${v.angle}°`)+label(420,145,'?');
      return svg('Cyclic quadrilateral ABCD; line DC extends through C to E. Find exterior angle BCE.',body,560,265)+'<p class="diagram-note">Diagram not to scale.</p>';
    }
    if(v.kind==='cubes'){
      const s=58,dx=20,dy=-21,baseY=200;let body='';
      v.heights.forEach((height,i)=>{for(let h=0;h<height;h++){const x=145+i*s,y=baseY-(h+1)*s;body+=`<path d="M${x} ${y}l${dx} ${dy}h${s}l${-dx} ${-dy}z" fill="#c9e7df" stroke="#236b54" stroke-width="2"/><path d="M${x+s} ${y}l${dx} ${dy}v${s}l${-dx} ${-dy}z" fill="#8fc4b4" stroke="#236b54" stroke-width="2"/><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#edf5f1" stroke="#236b54" stroke-width="2"/>`;}});
      body+=line(225,260,225,218,'#236b54')+'<path d="M219 226L225 217L231 226" fill="none" stroke="#236b54" stroke-width="2"/>'+label(225,285,'Front');
      return svg('A cube solid with front column heights '+v.heights.join(', ')+'. Front arrow points towards the square faces.',body,500,310);
    }
    return '';
  }
  root.MarcoReviewVisuals={visual,esc};
})(window);
