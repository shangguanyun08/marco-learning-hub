(function(){
  const previous=window.HarryStarVisuals.draw;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const line=(x,y,X,Y)=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="#193c49" stroke-width="3"/>`;
  const text=(x,y,t,size=24)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#193c49">${esc(t)}</text>`;
  const svg=(w,h,label,body)=>`<svg class="question-diagram oct4-diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const frac=(x,y,label)=>{
    const parts=String(label).match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
    if(!parts)return text(x,y+15,label,26);
    const whole=parts[1],fx=whole?x+13:x;
    return (whole?text(x-15,y+15,whole,25):'')+text(fx,y+2,parts[2],22)+line(fx-13,y+8,fx+13,y+8)+text(fx,y+32,parts[3],22);
  };
  window.HarryStarVisuals.draw=function(v,index){
    if(!v||typeof v!=='object')return previous(v,index);
    if(v.type==='choice-tables'){
      if(index===undefined)return '';
      return `<table class="rule-table oct4-choice-table"><thead><tr><th scope="col">Input (x)</th><th scope="col">Output (y)</th></tr></thead><tbody>${v.xs.map((x,i)=>`<tr><td>${esc(x)}</td><td>${esc(v.ys[index][i])}</td></tr>`).join('')}</tbody></table>`;
    }
    if(v.type==='line-pairs'){
      if(index===undefined)return '';
      return svg(500,225,'Pair '+String.fromCharCode(65+index)+' — two line segments.',v.sets[index].map(p=>line(...p)).join(''));
    }
    if(v.type==='boxplots'){
      if(index===undefined)return '';
      const values=v.sets[index],x=n=>40+(n-v.start)*540/(v.end-v.start);
      let body=text(310,27,v.title,26)+line(25,176,595,176);
      for(let n=v.start;n<=v.end;n+=5)body+=line(x(n),170,x(n),183)+text(x(n),211,n,22);
      body+=line(x(values[0]),115,x(values[4]),115)+`<rect x="${x(values[1])}" y="95" width="${x(values[3])-x(values[1])}" height="40" fill="white" stroke="#193c49" stroke-width="3"/>`+line(x(values[2]),95,x(values[2]),135);
      body+=`<circle cx="${x(values[0])}" cy="115" r="4" fill="#193c49"/><circle cx="${x(values[4])}" cy="115" r="4" fill="#193c49"/>`;
      body+=values.map((n,i)=>text(x(n),i%2?62:87,n,25)).join('');
      return svg(620,230,'Box plot '+String.fromCharCode(65+index)+' with labeled minimum, quartiles, median and maximum.',body);
    }
    if(v.type==='weight-plot'){
      if(index!==undefined)return '';
      let body=line(25,145,625,145);
      v.labels.forEach((label,i)=>{const x=45+i*93;body+=line(x,135,x,156)+frac(x,181,label)+Array.from({length:v.counts[i]},(_,j)=>text(x,127-j*29,'×',33)).join('');});
      return svg(650,285,'Weight line plot. Each X represents one item.',body+text(325,264,v.title,25));
    }
    return previous(v,index);
  };
})();
