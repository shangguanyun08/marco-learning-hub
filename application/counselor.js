'use strict';
const status=document.querySelector('#copy-status');
function announce(message){status.textContent=message;}
async function copyPlain(text,success){
 try{await navigator.clipboard.writeText(text);announce(success);}
 catch{announce('Copy is unavailable in this browser. Select the text below and copy it, or use Print / Save PDF.');}
}
document.querySelector('#copy-all').addEventListener('click',async()=>{
 const content=document.querySelector('#counselor-content'),text=content.innerText;
 try{
  const copy=content.cloneNode(true);copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  const html=`<div style="font-family:Georgia,serif;color:#000;line-height:1.6">${copy.innerHTML}</div>`;
  await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]);
  announce('Copied all five answers and the 15 changes with highlights. Paste using Keep Source Formatting if your email or Word asks.');
 }catch{await copyPlain(text,'Copied as plain text. Use Print / Save PDF to keep the yellow highlights.');}
});
document.querySelector('#copy-plain').addEventListener('click',()=>copyPlain(document.querySelector('#counselor-content').innerText,'Copied all five answers and the 15 changes as plain text.'));
document.querySelector('#copy-message').addEventListener('click',()=>copyPlain(document.querySelector('#counselor-message').innerText,'Copied the message for your counselor.'));
document.querySelector('#print-copy').addEventListener('click',()=>window.print());
