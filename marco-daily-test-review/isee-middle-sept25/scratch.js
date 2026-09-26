(function(root){
  'use strict';
  const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const drawn=new Set(),mounted=new WeakSet();
  let finishActive=null;
  const lines=strokes=>(strokes||[]).map(points=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#193c49" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const hasWork=work=>!!(work?.text?.trim()||work?.strokes?.length);
  function view(work,label='View main steps'){
    if(!hasWork(work))return '';
    return `<details class="scratch-record"><summary>${esc(label)}</summary>${work.text?`<p class="scratch-written">${esc(work.text)}</p>`:''}${work.strokes?.length?`<svg class="scratch-preview" viewBox="0 0 800 600" role="img" aria-label="Saved handwritten main steps">${lines(work.strokes)}</svg>`:''}</details>`;
  }
  function markup(part,source,work,{handwritingOnly=false}={}){
    const key=part+'-'+source,show=handwritingOnly||!!work?.strokes?.length||drawn.has(key);
    const heading=handwritingOnly?'<strong>My main steps <small>(optional)</small></strong>':`<label for="steps-${key}">My main steps <small>(optional)</small></label>`;
    const typing=handwritingOnly?'':`<textarea id="steps-${key}" class="scratch-text" rows="2" maxlength="4000" placeholder="What will you do first? Write your plan or key calculation.">${esc(work?.text)}</textarea><button class="scratch-toggle" type="button" aria-expanded="${show}" aria-controls="drawing-${key}">${show?'Hide handwriting box':'Write by hand'}</button>`;
    return `<section class="scratch" data-scratch-part="${part}" data-scratch-source="${source}" aria-label="Main steps for this question"><div class="scratch-heading">${heading}<span>Saved with each try</span></div>${typing}<div class="scratch-drawing" id="drawing-${key}" ${show?'':'hidden'}><p class="scratch-hint">Write with your finger, Apple Pencil, or mouse. Scroll outside the box.</p><svg class="scratch-pad" viewBox="0 0 800 600" role="img" aria-label="Handwriting box for your main steps"><g>${lines(work?.strokes)}</g></svg><div class="scratch-tools"><button type="button" data-scratch-action="undo" ${work?.strokes?.length?'':'disabled'}>Undo stroke</button><button type="button" data-scratch-action="clear" ${work?.strokes?.length?'':'disabled'}>Clear handwriting</button></div><p class="scratch-status" role="status"></p></div></section>`;
  }
  function mount(container,{read,change}){
    container.querySelectorAll('[data-scratch-part]').forEach(box=>{
      if(mounted.has(box))return;mounted.add(box);
      const part=box.dataset.scratchPart,source=Number(box.dataset.scratchSource),key=part+'-'+source;
      const svg=box.querySelector('.scratch-pad'),group=svg.querySelector('g'),status=box.querySelector('.scratch-status');
      const work=()=>read(part,source)||{};
      const stamp=old=>new Date(Math.max(Date.now(),Date.parse(old||'1970-01-01')+1)).toISOString();
      const write=(field,value)=>{const at=field==='text'?'textAt':'drawingAt';change(part,source,{[field]:value,[at]:stamp(work()[at])});};
      const controls=()=>box.querySelectorAll('[data-scratch-action]').forEach(button=>{button.disabled=!(work().strokes||[]).length;});
      const redraw=()=>{group.innerHTML=lines(work().strokes);controls();};
      box.querySelector('.scratch-text')?.addEventListener('input',event=>write('text',event.target.value));
      box.querySelector('.scratch-toggle')?.addEventListener('click',event=>{
        const panel=box.querySelector('.scratch-drawing');panel.hidden=!panel.hidden;
        if(panel.hidden)drawn.delete(key);else drawn.add(key);
        event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));
        event.currentTarget.textContent=panel.hidden?'Write by hand':'Hide handwriting box';
      });
      let stroke=null,pointer=null,line=null;
      function point(event){
        const bounds=svg.getBoundingClientRect();
        return [Math.max(0,Math.min(800,Math.round((event.clientX-bounds.left)/bounds.width*800))),Math.max(0,Math.min(600,Math.round((event.clientY-bounds.top)/bounds.height*600)))];
      }
      function finish(){
        if(!stroke)return;
        const finished=stroke;stroke=null;pointer=null;finishActive=null;
        write('strokes',[...(work().strokes||[]),finished]);controls();
        status.textContent='Handwriting saved.';
      }
      svg.addEventListener('pointerdown',event=>{
        if(pointer!==null||event.button!==0)return;
        if((work().strokes||[]).length>=120){status.textContent='The box is full. Undo a stroke or clear the handwriting to keep writing.';return;}
        event.preventDefault();finishActive?.();pointer=event.pointerId;
        svg.setPointerCapture?.(pointer);const p=point(event);stroke=[p,[...p]];
        line=root.document.createElementNS('http://www.w3.org/2000/svg','polyline');
        for(const [name,value] of Object.entries({fill:'none',stroke:'#193c49','stroke-width':'3','stroke-linecap':'round','stroke-linejoin':'round'}))line.setAttribute(name,value);
        line.setAttribute('points',stroke.map(p=>p.join(',')).join(' '));group.append(line);finishActive=finish;
        status.textContent='';
      });
      svg.addEventListener('pointermove',event=>{
        if(!stroke||pointer!==event.pointerId)return;event.preventDefault();
        const p=point(event),last=stroke.at(-1);
        if(Math.hypot(p[0]-last[0],p[1]-last[1])<2)return;
        if(stroke.length>=600)stroke=stroke.filter((_,i)=>i%2===0);
        stroke.push(p);line.setAttribute('points',stroke.map(p=>p.join(',')).join(' '));
      });
      for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,event=>{if(pointer===event.pointerId)finish();});
      for(const button of box.querySelectorAll('[data-scratch-action]'))button.addEventListener('click',()=>{
        finish();write('strokes',button.dataset.scratchAction==='undo'?(work().strokes||[]).slice(0,-1):[]);redraw();
        status.textContent=button.dataset.scratchAction==='undo'?'Last stroke removed.':'Handwriting cleared.';
      });
    });
  }
  root.MarcoScratch={markup,mount,view,hasWork,flush:()=>finishActive?.(),isDrawing:()=>!!finishActive};
})(window);
