(function(){
  const previous=window.HarryStarVisuals.draw;
  const line=(x,y,X,Y)=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="#193c49" stroke-width="3"/>`;
  const text=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="24" fill="#193c49">${t}</text>`;
  const svg=(w,h,label,body)=>`<svg class="question-diagram oct10-diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const shape=(name,x,y)=>name==='Circle'?`<circle cx="${x}" cy="${y}" r="18" fill="#28b8d1" stroke="#193c49"/>`:name==='Square'?`<rect x="${x-18}" y="${y-18}" width="36" height="36" fill="#ffdf4b" stroke="#193c49"/>`:`<polygon points="${Array.from({length:10},(_,i)=>{const a=(i*36-90)*Math.PI/180,r=i%2?10:22;return `${x+r*Math.cos(a)},${y+r*Math.sin(a)}`;}).join(' ')}" fill="#ffdf4b" stroke="#193c49"/>`;
  window.HarryStarVisuals.draw=function(v,index){
    if(!v?.type?.startsWith('oct10-'))return previous(v,index);
    if(index!==undefined)return '';
    if(v.type==='oct10-angle'){
      const a=v.degrees*Math.PI/180,x=200,y=42,X=x+165*Math.cos(a),Y=y+165*Math.sin(a);
      const arrow=(px,py,theta)=>`<path d="M ${px-13*Math.cos(theta-.45)} ${py-13*Math.sin(theta-.45)} L ${px} ${py} L ${px-13*Math.cos(theta+.45)} ${py-13*Math.sin(theta+.45)}" fill="none" stroke="#193c49" stroke-width="3"/>`;
      return svg(410,235,'Two rays meet at a vertex. A curved mark shows the angle to name.',line(x,y,365,y)+line(x,y,X,Y)+arrow(365,y,0)+arrow(X,Y,a)+`<path d="M ${x+38} ${y} A 38 38 0 0 1 ${x+38*Math.cos(a)} ${y+38*Math.sin(a)}" fill="none" stroke="#193c49" stroke-width="2"/>`);
    }
    if(v.type==='oct10-numberline')return svg(580,170,`Number line from zero to one in four equal intervals. The three interior ticks, from left to right, have a ${v.shapes.join(', ')}.`,line(40,55,540,55)+Array.from({length:5},(_,i)=>line(40+i*125,44,40+i*125,66)).join('')+text(40,105,'0')+text(540,105,'1')+v.shapes.map((s,i)=>shape(s,165+i*125,100)).join(''));
    if(v.type==='oct10-radius')return svg(390,270,`A circle with a segment from its center to its right edge labeled ${v.radius} inches.`,`<circle cx="185" cy="135" r="112" fill="white" stroke="#193c49" stroke-width="3"/><circle cx="185" cy="135" r="4" fill="#193c49"/>`+line(185,135,297,135)+text(241,120,`${v.radius} inches`));
    return '';
  };
})();
