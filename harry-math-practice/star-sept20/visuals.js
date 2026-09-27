(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=(w,h,label,body)=>`<svg class="question-diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const text=(x,y,s,size=17)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#193c49">${esc(s)}</text>`;
  const line=(x,y,X,Y,extra='')=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="#193c49" ${extra}/>`;
  function draw(v,index){
    if(!v||typeof v!=='object')return '';
    if(v.type==='lines'){
      if(index===undefined)return '';
      const n=(v.end-v.start)*v.den,x=i=>35+i*480/n;
      return svg(550,90,'Number line '+String.fromCharCode(65+index)+'. Whole numbers from '+v.start+' to '+v.end+', with '+v.den+' equal intervals per whole and one dot.',line(25,30,525,30,'stroke-width="2"')+Array.from({length:n+1},(_,i)=>line(x(i),i%v.den?25:20,x(i),i%v.den?35:40)+(i%v.den?'':text(x(i),68,v.start+i/v.den,28))).join('')+`<circle cx="${x(v.steps[index])}" cy="30" r="6" fill="#193c49"/>`);
    }
    if(index!==undefined)return '';
    if(v.type==='plot')return svg(640,260,'Distance jumped in feet. Each X represents one student.',text(320,25,'Distance Jumped (ft)',28)+line(35,200,605,200)+v.counts.map((count,i)=>{const x=55+i*88;return line(x,195,x,205)+text(x,231,v.labels[i],26)+Array.from({length:count},(_,j)=>text(x,184-j*23,'×',28)).join('');}).join(''));
    if(v.type==='rectangle')return svg(570,255,`Rectangle labeled ${v.width} ${v.unit} wide and ${v.height} ${v.unit} tall.`,`<rect x="60" y="25" width="340" height="160" fill="#f4f7f3" stroke="#193c49" stroke-width="3"/>`+text(230,225,v.width+' '+v.unit,28)+text(477,111,v.height+' '+v.unit,25));
    if(v.type==='coordinates'){
      const xy=(x,y)=>[220+x*29,205-y*29];let body='';
      for(let i=-5;i<=5;i++){const [x,y]=xy(i,i);body+=line(x,45,x,365,'stroke-opacity=".16"')+line(60,y,380,y,'stroke-opacity=".16"');if(i!==0)body+=text(x,225,i,16)+text(201,y+5,i,16);}
      body+=line(45,205,395,205,'stroke-width="2"')+line(220,380,220,30,'stroke-width="2"')+text(410,210,'x')+text(221,20,'y')+text(204,225,'0',16);
      for(const [label,point] of Object.entries(v.points)){const [x,y]=xy(...point);body+=`<circle cx="${x}" cy="${y}" r="5" fill="#193c49"/>`+text(x+14,y-10,label,24);}
      return svg(440,405,'Coordinate grid with labeled points. Each grid interval is one unit.',body);
    }
    return '';
  }
  window.HarryStarVisuals={draw};
})();
