(function(root){
  'use strict';
  const VERSION='similar-v1',blue='#245b88',gold='#e9b94c',white='#fff',ink='#173b53',colors=[blue,gold,white];
  const mod=(n,d)=>((n%d)+d)%d, clone=o=>JSON.parse(JSON.stringify(o));
  const svg=(body,w=360,h=360)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="white"/>${body}</svg>`;
  const uri=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
  const rect=(x,y,w,h,fill,stroke=ink,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${extra}/>`;
  const line=(x1,y1,x2,y2,color=ink,width=3)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
  const text=(s,x,y,size=16)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${ink}" font-family="system-ui,sans-serif" font-size="${size}">${s}</text>`;
  const poly=(points,fill,stroke=ink,extra='')=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${extra}/>`;
  const turn=(body,angle,cx=50,cy=50)=>`<g transform="rotate(${angle} ${cx} ${cy})">${body}</g>`;
  function shape(name,fill=blue,size=62){
    const a=50-size/2,b=50+size/2;
    if(name==='circle')return `<circle cx="50" cy="50" r="${size/2}" fill="${fill}" stroke="${ink}" stroke-width="2.5"/>`;
    if(name==='diamond')return poly([[50,a],[b,50],[50,b],[a,50]],fill);
    if(name==='triangle')return poly([[50,a],[b,b],[a,b]],fill);
    if(name==='arrow')return poly([[a,39],[55,39],[55,a],[b,50],[55,b],[55,61],[a,61]],fill);
    if(name==='star')return poly(Array.from({length:10},(_,i)=>{const r=i%2?size*.21:size*.5,t=(i*36-90)*Math.PI/180;return [50+Math.cos(t)*r,50+Math.sin(t)*r];}),fill);
    return rect(a,a,size,size,fill);
  }
  function cell(s){
    let body=rect(2,2,96,96,s.bg||'#fafbfd','#aec1cc');
    const c=s.color||blue;
    if(s.kind==='wheel'){
      for(let i=0;i<4;i++)body+=turn(`<path d="M50 50L50 14A36 36 0 0 1 86 50Z" fill="${s.sectors?s.sectors[i]:i<s.count?c:white}" stroke="${ink}" stroke-width="2"/>`,i*90+(s.angle||0));
    }else if(s.kind==='code'){
      s.tokens.forEach((token,i)=>body+=`<g transform="translate(${i*29+8} 35) scale(.27)">${shape(token[0],token[1],70)}</g>`);
    }else if(s.kind==='counts'){
      for(let i=0;i<s.a;i++)body+=`<g transform="translate(${7+i*19} 10) scale(.25)">${shape('circle',c,57)}</g>`;
      for(let i=0;i<s.b;i++)body+=`<g transform="translate(${7+i*19} 58) scale(.25)">${shape('triangle',s.second||gold,57)}</g>`;
    }else if(s.kind==='nested'){
      body+=shape(s.outer||'diamond',s.outerColor||gold,s.outerSize||82)+shape(s.inner||'square',c,s.innerSize||32);
    }else if(s.kind==='flower'){
      body+=turn(Array.from({length:4},(_,i)=>turn(`<ellipse cx="50" cy="24" rx="13" ry="20" fill="${i===0?white:c}" stroke="${ink}" stroke-width="2"/>`,i*90)).join(''),s.angle||0);
      body+=shape(s.center||'circle',gold,22);
    }else if(s.kind==='connector'){
      body+=turn(`<g transform="translate(-15 0) scale(.65 1)">${shape(s.left||'circle',s.leftColor||gold,34)}</g><g transform="translate(50 0) scale(.65 1)">${shape(s.right||'diamond',s.rightColor||blue,34)}</g>`+line(32,50,66,50)+poly([[65,43],[74,50],[65,57]],ink),s.angle||0);
    }else if(s.kind==='bits'){
      for(let i=0;i<9;i++)if(s.mask&(1<<i))body+=rect(8+(i%3)*28,8+Math.floor(i/3)*28,28,28,c);
    }else if(s.kind==='arrows'){
      body+=turn(shape('arrow',blue,76),s.angle)+turn(shape('arrow',gold,51),s.secondAngle);
    }else if(s.kind==='lines'){
      body+=shape('square',s.bg||white,74);
      body+=s.pattern===0?line(50,15,50,85,c)+line(15,50,85,50,c):s.pattern===1?line(16,16,84,84,c)+line(84,16,16,84,c):line(32,15,32,85,c)+line(68,15,68,85,c);
    }else{
      if(s.count){for(let i=0;i<s.count;i++)body+=`<g transform="translate(${s.side==='left'?3:47} ${10+i*27}) scale(.42 .25)">${turn(shape(s.shape||'arrow',c,72),s.angle||0)}</g>`;}
      else body+=turn(shape(s.shape||'arrow',c,s.size||64),s.angle||0);
      if(s.divider)body+=s.divider==='vertical'?line(50,12,50,88):line(12,50,88,50);
      if(s.dot)body+=`<circle cx="${s.dot[0]}" cy="${s.dot[1]}" r="7" fill="${gold}" stroke="${ink}" stroke-width="2"/>`;
    }
    return body;
  }
  function matrix(cells,note='Find the missing picture'){
    let b=text(note,180,24,15);
    for(let i=0;i<9;i++){const x=20+(i%3)*108,y=40+Math.floor(i/3)*104;b+=`<g transform="translate(${x} ${y})">${cells[i]?cell(cells[i]):rect(2,2,96,96,'#f1f5f7',ink,'stroke-dasharray="6 4"')+text('?',50,65,44)}</g>`;}
    return svg(b,360,360);
  }
  function analogy(cells){return svg(text('Use the same change in both rows',235,27,18)+cells.map((s,i)=>`<g transform="translate(${i%2?305:55} ${i<2?58:215})">${s?cell(s):rect(2,2,96,96,'#f1f5f7',ink,'stroke-dasharray="6 4"')+text('?',50,65,44)}</g>`).join('')+text('→',235,120,38)+text('→',235,277,38),470,330);}
  function shuffledChoices(correct,wrong,answer,render=cell){
    const choices=wrong.map(clone);choices.splice(answer,0,clone(correct));
    return {choices,choiceSvgs:choices.map(s=>svg(render(s),100,100))};
  }
  function patternScene(number,v){
    let b=rect(0,0,300,300,v?gold:'#eef5f8',ink);
    const c=v?blue:gold,d=v?white:blue;
    if(number===3){
      for(let x=12;x<300;x+=46)b+=rect(x,0,9,300,d,'none');
      for(let y=19;y<300;y+=57)b+=rect(0,y,300,8,d,'none');
    }else if(number===5||number===37){
      const cx=number===5?136:112,cy=number===5?144:174;
      for(let r=260;r>0;r-=number===5?25:19)b+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${Math.floor(r/(number===5?25:19))%2?d:c}" stroke-width="${number===5?12:9}"/>`;
      if(number===5)for(let a=17;a<360;a+=45)b+=turn(line(cx,cy,cx,cy-260,ink,4),a,cx,cy);
      if(number===37)b+=line(0,116,300,116,white,7);
    }else if(number===12){
      for(let y=-5;y<330;y+=58)for(let x=-7;x<330;x+=64)b+=`<g transform="translate(${x} ${y})">${rect(16,0,18,48,d,'none')+rect(0,15,50,18,d,'none')+rect(21,20,9,9,c,'none')}</g>`;
    }else if(number===23){
      b+=poly([[8,290],[150,8],[290,290]],c,'none');
      for(let p=-270;p<500;p+=47){b+=line(p,0,p+200,300,d,5)+line(p,300,p+270,0,d,3);}
      b+=line(0,154,300,154,ink,4);
    }else if(number===25){
      for(let y=0;y<300;y+=60)for(let x=0;x<300;x+=60){b+=`<g transform="translate(${x} ${y})">${poly([[5,5],[49,5],[49,49],[29,49],[29,24],[5,24]],d)+`<circle cx="12" cy="43" r="7" fill="${(x/60+y/60)%2?c:'none'}" stroke="${ink}" stroke-width="3"/>`}</g>`;}
    }else{
      b+=poly([[0,0],[300,0],[300,261],[0,66]],c,'none');
      for(let p=-300;p<600;p+=31)b+=line(p,0,p+195,300,d,5);
      b+=line(0,66,300,261,ink,5);
    }
    // An asymmetric border feature makes mirrored distractors unambiguous.
    return b+line(174,0,174,300,ink,3)+line(0,129,300,129,ink,3);
  }
  function patchQuestion(number,v,answer){
    const x=110+v*8,y=94+v*13,scene=patternScene(number,v),patch=`<svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} 90 90">${scene}</svg>`;
    const render=s=>`<g transform="${s.transform||''}">${s.scene||patch}</g>`;
    const correct={scene:patch},wrong=[{scene:`<svg width="100" height="100" viewBox="${x+21} ${y+14} 90 90">${scene}</svg>`},{scene:patch,transform:'rotate(90 50 50)'},{scene:patch,transform:'translate(100 0) scale(-1 1)'},{scene:patch,transform:'rotate(180 50 50)'}];
    const choices=shuffledChoices(correct,wrong,answer,render);
    return {diagram:svg(`<svg x="30" y="38" width="300" height="300" viewBox="0 0 300 300">${scene}${rect(x,y,90,90,'white',ink,'stroke-dasharray="6 4"')}${text('?',x+45,y+61,46)}</svg>`+text('Which patch fits the gap?',180,24,16),360,365),...choices,explanation:'Continue every line and colour through all four edges of the gap. The correct patch fits without shifting, turning, or changing any part.'};
  }
  function analogue(number,v,answer){
    let a,b,c,d,wrong,explanation;
    const angle=45+v*90;
    if(number===1){a={shape:'diamond',color:gold};b={...a,divider:'vertical'};c={shape:v?'triangle':'arrow',color:blue,angle:v*90};d={...c,divider:'vertical'};wrong=[{...c,divider:'horizontal'},{...c},{...d,color:gold},{...d,angle:c.angle+90}];explanation='Add a vertical dividing line. Keep the new shape, its colour, and its direction unchanged.';}
    else if(number===15){a={kind:'wheel',count:3+v,color:gold,angle:v*90};b={...a,count:a.count-1};c={...a,count:2+v,angle:90+v*90};d={...c,count:c.count-1};wrong=[{...d,count:c.count},{...d,count:d.count+2},{...d,angle:d.angle+180},{...d,color:blue}];explanation='Remove one coloured quarter at each step. Keep the remaining quarters in the same order around the circle.';}
    else if(number===16){a={shape:'arrow',color:white,bg:gold,angle};b={...a,color:gold,bg:white,angle:angle-45};c={shape:'triangle',color:white,bg:gold,angle:angle+90};d={...c,color:gold,bg:white,angle:c.angle-45};wrong=[{...d,angle:c.angle+45},{...d,color:white,bg:gold},{...d,angle:c.angle},{...d,bg:blue}];explanation='Turn 45° anticlockwise and swap the yellow and white areas. Both changes are needed.';}
    else if(number===19){const convert=t=>t.map(([s,col])=>col===gold?['triangle',blue]:col===blue?['square',gold]:[s,col]);a={kind:'code',tokens:[['square',gold],['square',blue],['square',white]]};b={...a,tokens:convert(a.tokens)};c={kind:'code',tokens:v?[['square',white],['square',gold],['square',blue]]:[['square',blue],['square',white],['square',gold]]};d={...c,tokens:convert(c.tokens)};wrong=[{...c},{...d,tokens:d.tokens.slice().reverse()},{...d,tokens:d.tokens.map(([s,col])=>[s,col===blue?gold:col])},{...d,tokens:d.tokens.map(([s,col])=>[s==='triangle'?'square':'triangle',col])}];explanation='Yellow squares become blue triangles; blue squares become yellow squares; white squares stay white. Keep the three positions unchanged.';}
    else if(number===22){a={kind:'counts',a:2,b:3};b={...a,a:3,b:2};c={kind:'counts',a:1+v,b:4};d={...c,a:c.a+1,b:c.b-1};wrong=[{...c},{...d,a:c.a-1},{...d,b:4},{...d,a:d.b,b:d.a,second:white}];explanation='Add one circle to the upper group and remove one triangle from the lower group. Keep the two groups on their original rows.';}
    else if(number===23){const convert=ss=>ss.map(col=>col===gold?blue:gold);a={kind:'wheel',sectors:[gold,blue,white,gold]};b={...a,sectors:convert(a.sectors)};c={kind:'wheel',sectors:v?[white,gold,blue,white]:[blue,gold,white,blue]};d={...c,sectors:convert(c.sectors)};wrong=[{...c},{...d,sectors:d.sectors.slice(1).concat(d.sectors[0])},{...d,sectors:d.sectors.map(col=>col===blue?gold:blue)},{...d,sectors:[blue,blue,blue,gold]}];explanation='Yellow becomes blue. Blue and white both become yellow. Keep every sector in its original position.';}
    else if(number===26){a={kind:'flower',center:'circle',color:blue,angle:v*90};b={...a,angle:a.angle+90};c={...a,center:'star',angle:90+v*90};d={...c,angle:c.angle+90};wrong=[{...c},{...d,angle:c.angle-90},{...d,center:'circle'},{...d,angle:c.angle+180}];explanation='Turn the petals 90° clockwise. Keep the centre symbol unchanged.';}
    else{a={kind:'connector',left:'circle',right:'triangle',leftColor:gold,rightColor:blue,angle:v*90};b={...a,leftColor:white,rightColor:gold,angle:a.angle-90};c={...a,left:'diamond',right:'circle',angle:45+v*90};d={...c,leftColor:white,rightColor:gold,angle:c.angle-90};wrong=[{...d,angle:c.angle+90},{...d,leftColor:gold,rightColor:blue},{...d,angle:c.angle},{...d,left:'circle',right:'diamond'}];explanation='Turn the whole pair 90° anticlockwise, make the first shape white, and make the second shape yellow. Keep the arrow pointing from the first shape to the second.';}
    return {diagram:analogy([a,b,c,null]),...shuffledChoices(d,wrong,answer),explanation};
  }
  function serial(number,v,answer){
    const cells=[];let d,wrong,explanation;
    for(let r=0;r<3;r++)for(let c=0;c<3;c++){
      let s;
      if(number===1)s={shape:'arrow',angle:90*v+(c%2?180:0),color:colors[r],bg:colors[(r+1)%3]};
      else if(number===19)s={shape:'arrow',count:mod(r+c+v,3)+1,side:'left',angle:90*v,color:blue};
      else if(number===4)s={kind:'nested',outer:v?'diamond':'square',inner:v?'circle':'triangle',outerColor:colors[r],color:colors[(r+1)%3],outerSize:48+r*18,innerSize:36-r*9};
      else if(number===5)s={shape:'star',color:blue,size:[34,52,72][mod(r+c+v,3)],dot:[20+c*30,20+r*30]};
      else if(number===9)s={kind:'nested',outerColor:colors[mod(r+c+v,3)],color:colors[mod(r+2*c+v+1,3)]};
      else if(number===12)s={shape:'arrow',angle:r*90+c*45+v*45,color:c%2?gold:white,bg:blue};
      else if(number===14)s={kind:'arrows',angle:(r*3+c)*45+v*45,secondAngle:45-(r*3+c)*90+v*90};
      else s={kind:'lines',pattern:mod(r+c+v,3),color:colors[r],bg:colors[(r+1)%3]};
      if(r===2&&c===2)d=s;cells.push(r===2&&c===2?null:s);
    }
    if(number===1){wrong=[{...d,angle:d.angle+180},{...d,color:gold},{...d,bg:gold},{...d,angle:d.angle+90}];explanation='Across each row, arrow direction alternates. The third arrow matches the first. Keep the bottom row’s colours.';}
    else if(number===19){wrong=[{...d,count:mod(d.count,3)+1},{...d,count:mod(d.count+1,3)+1},{...d,side:'right'},{...d,angle:d.angle+180}];explanation='Each row and column contains one, two, and three arrows. Keep the arrows on the left side of the box.';}
    else if(number===4){wrong=[{...d,innerSize:36},{...d,outerSize:48},{...d,color:gold},{...d,inner:d.outer,outer:d.inner}];explanation='Down each column, the outer shape grows and the inner shape shrinks. Keep the bottom row’s colours and the same inner and outer shapes.';}
    else if(number===5){wrong=[{...d,size:34},{...d,size:52},{...d,dot:[20,80]},{...d,dot:[80,20]}];if(d.size===34)wrong[0].size=72;if(d.size===52)wrong[1].size=72;explanation='Each row and column uses each star size once. The circle’s column gives its left-to-right position; its row gives its top-to-bottom position.';}
    else if(number===9){wrong=[{...d,color:colors[(colors.indexOf(d.color)+1)%3]},{...d,outerColor:colors[(colors.indexOf(d.outerColor)+1)%3]},{...d,color:colors[(colors.indexOf(d.color)+2)%3],outerColor:colors[(colors.indexOf(d.outerColor)+2)%3]},{...d,inner:'circle'}];explanation='Each row and column uses each colour once for the inner shape and once for the outer shape. Check both colour cycles separately.';}
    else if(number===12){wrong=[{...d,angle:d.angle+45},{...d,color:gold},{...d,angle:d.angle-45},{...d,bg:white}];explanation='Moving right turns the arrow 45° clockwise. Its colour alternates white, yellow, white. Keep the blue background.';}
    else if(number===14){wrong=[{...d,angle:d.angle+45},{...d,secondAngle:d.secondAngle+90},{...d,angle:d.angle-45,secondAngle:d.secondAngle-90},{...d,angle:d.secondAngle,secondAngle:d.angle}];explanation='Read each row from left to right. The blue arrow turns 45° clockwise at each step; the yellow arrow turns 90° anticlockwise. Keep yellow in front.';}
    else{wrong=[{...d,pattern:(d.pattern+1)%3},{...d,pattern:(d.pattern+2)%3},{...d,color:gold},{...d,bg:white}];explanation='Each row and column uses all three line patterns once. Keep the bottom row’s line colour and background.';}
    return {diagram:matrix(cells),...shuffledChoices(d,wrong,answer),explanation};
  }
  function spatial(number,v,answer){
    if(number===2||number===17){
      const masks=number===2?[3,24,64,128]:[17,34,136,256];
      const [a,b,c,d]=masks.map(m=>v?mod(m*2,512)||1:m),correct={kind:'bits',mask:a|b|c|d,color:blue};
      const masksGrid=[a,b,a|b,c,d,c|d,a|c,b|d,null],cells=masksGrid.map(mask=>mask===null?null:{kind:'bits',mask,color:blue});
      const wrong=[{...correct,mask:a|b|c},{...correct,mask:b|c|d},{...correct,mask:a|d},{...correct,mask:(a|b|c|d)^4}];
      return {diagram:matrix(cells,'Overlay the first two to make the third'),...shuffledChoices(correct,wrong,answer),explanation:'Combine all blue parts from the first two boxes to make the third. This works across every row and down every column. Overlapping blue parts stay blue.'};
    }
    const bg=[18,24].includes(number)?gold:number===19?'#cfe3f2':'#edf5f8';
    const transparent=[8,18,19,24].includes(number),rotation=[7,19].includes(number)?90:0;
    const flaps=[];
    if(number===5){flaps.push({side:'top',points:[[105,100],[185,100],[128+v*10,53]],fill:gold},{side:'right',points:[[200,110],[200,193],[250,168-v*10]],fill:blue},{side:'bottom',points:[[113,200],[188,200],[166,252+v*8]],fill:gold},{side:'left',points:[[100,107],[100,182],[49-v*5,136]],fill:blue});}
    else if(number===7){flaps.push({side:'top',points:[[112,100],[135,100],[135,65-v*6],[157,65-v*6],[157,43],[112,43]],fill:blue},{side:'right',points:[[200,128],[228,128],[228,112],[256+v*8,147],[228,182],[228,166],[200,166]],fill:gold},{side:'bottom',points:[[146,200],[180,200],[180,239],[158+v*9,251],[146,235]],fill:'none'});}
    else if(number===8){flaps.push({side:'top',points:[[108,100],[143,100],[143,64-v*6],[108,64-v*6]],fill:'none'},{side:'right',points:[[200,146],[240+v*5,146],[240+v*5,186],[200,186]],fill:'none'});}
    else if(number===18){flaps.push({side:'left',points:[[100,116],[74,116],[74,105],[48-v*8,138],[74,169],[74,157],[100,157]],fill:blue},{side:'right',points:[[200,143],[222,143],[222,130],[250+v*6,169],[222,194],[222,181],[200,181]],fill:blue});}
    else if(number===19){flaps.push({side:'top',points:[[107,100],[169,100],[128,49-v*7]],fill:'none'},{side:'bottom',points:[[139,200],[191,200],[181,235+v*8]],fill:'none'});}
    else{flaps.push({side:'bottom',points:[[110,200],[146+v*5,200],[146+v*5,265],[110,265]],fill:'none'},{side:'right',points:[[200,121],[270,121],[270,157+v*6],[200,157+v*6]],fill:'none'});}
    const base=()=>rect(100,100,100,100,bg)+([8,18].includes(number)?line(108,110,190,190,white,6)+line(110,190,188,108,white,6):'')+(number===18?poly([[150,116],[178,140],[169,176],[135,176],[124,140]],'none',white):'');
    const drawing=f=>poly(f.points,f.fill,ink,transparent&&f.fill!=='none'?'fill-opacity=".4"':'');
    const reflected=flaps.map(f=>({...f,points:f.points.map(([x,y])=>[f.side==='left'?200-x:f.side==='right'?400-x:x,f.side==='top'?200-y:f.side==='bottom'?400-y:y])}));
    // Side flaps fold first; top and bottom flaps fold last.
    reflected.sort((a,b)=>Number(['top','bottom'].includes(a.side))-Number(['top','bottom'].includes(b.side)));
    const folded=base()+reflected.map(drawing).join('');
    const render=s=>`<g transform="translate(-100 -100)">${turn(s.mirror?`<g transform="translate(300 0) scale(-1 1)">${folded}</g>`:folded,s.angle,150,150)}</g>`;
    const correct={angle:rotation},wrong=[90,180,270].map(a=>({angle:mod(rotation+a,360)})).concat({angle:rotation,mirror:true});
    const instruction=text('Fold inward',180,24,15)+(rotation?text('Then turn 90° clockwise.',180,44,13):'')+(transparent?text('Keep all outlines visible.',180,rotation?64:44,13):'');
    const diagram=svg(instruction+`<g transform="translate(30 38)">${base()}${flaps.map(drawing).join('')}${line(100,100,200,100,ink,1)}${line(200,100,200,200,ink,1)}${line(100,200,200,200,ink,1)}${line(100,100,100,200,ink,1)}</g>`+text('Fold on the edges of the central square.',180,334,13)+(number===5?text('Fold side flaps first; top and bottom last.',180,352,12):''),360,365);
    return {diagram,...shuffledChoices(correct,wrong,answer,render),explanation:'Reflect each outside flap across the edge where it touches the square. '+(rotation?'Then rotate the entire folded square 90° clockwise. ':'')+(transparent?'The shapes are transparent: preserve all crossing outlines and the background.':'Keep the colours attached to their own flaps; fold the side flaps before the top and bottom.')};
  }
  const cache=new Map();
  function get(course,id){
    const match=/^(pattern|analogy|serial|spatial)-(\d+)-similar-v1-r([23])$/.exec(id);if(!match)return null;
    const sourceId=match[1]+'-'+match[2],source=course.questions.find(q=>q.id===sourceId);if(!source)return null;
    if(cache.has(id))return cache.get(id);
    const n=Number(match[2]),round=Number(match[3]),v=round-2,answer=mod(n+round*2,5);
    const task=source.type==='pattern'?(n===20?(()=>{const cells=Array.from({length:9},(_,i)=>i===8?null:{shape:'arrow',angle:mod(i%3+v,4)*90,color:colors[mod(Math.floor(i/3)+i%3+v,3)]}),d={shape:'arrow',angle:mod(2+v,4)*90,color:colors[mod(4+v,3)]};return {diagram:matrix(cells),...shuffledChoices(d,[{...d,angle:d.angle+90},{...d,color:colors[mod(5+v,3)]},{...d,angle:d.angle+180},{...d,color:colors[mod(6+v,3)]}],answer),explanation:'Moving right turns the arrow 90° clockwise and cycles its colour. Check the direction pattern and the colour pattern separately.'};})():patchQuestion(n,v,answer)):source.type==='analogy'?analogue(n,v,answer):source.type==='serial'?serial(n,v,answer):spatial(n,v,answer);
    const result={...source,id,sourceId,variantVersion:VERSION,practiceRound:round,numberedOptions:false,answer,title:source.title,explanation:task.explanation,figures:[uri(task.diagram),...task.choiceSvgs.map(uri)],rule:source.title,choiceModels:task.choices};
    cache.set(id,result);return result;
  }
  function idFor(q,round){return (q.sourceId||q.id)+'-'+VERSION+'-r'+round;}
  const api={VERSION,get,idFor};
  if(typeof module!=='undefined')module.exports=api;else root.NNATVariants=api;
})(typeof window==='undefined'?{}:window);
