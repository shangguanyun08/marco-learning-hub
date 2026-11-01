// Keep the existing paragraph IDs for online drafts and the editorial workflow.
export function setAnswer(state, question, text) {
 const blocks=text.split(/\n\s*\n/),last=question.paragraphs.length-1;
 question.paragraphs.forEach((p,i)=>{const value=i===last?blocks.slice(i).join('\n\n'):(blocks[i]||'');state.edits[p.id].text=value;state.edits[p.id].status=value===p.original?'review':'editing';});
}
export const fullAnswer=(state,q)=>q.paragraphs.map(p=>state.edits[p.id].text).filter(t=>t.trim()).join('\n\n');
export function validAnnotation(a){
 if(a?.suggestionVersion!==undefined&&!['v1','v2'].includes(a.suggestionVersion))return false;
 if(a?.paragraphId!==undefined&&(typeof a.paragraphId!=='string'||!/^q[1-5]-p[1-9][0-9]*$/.test(a.paragraphId)||!a.paragraphId.startsWith(`q${a.question}-`)))return false;
 return a===null||!!(a&&typeof a.id==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(a.id)&&Number.isInteger(a.question)&&a.question>=1&&a.question<=5&&['original','suggested','revision'].includes(a.side)&&typeof a.note==='string'&&a.note.length<=12000&&typeof a.reference==='string'&&a.reference.length<=60000&&typeof a.quote==='string'&&a.quote.length<=2000&&typeof a.createdAt==='string'&&['open','done'].includes(a.status)&&(a.rect===null||a.rect&&['x','y','w','h'].every(k=>Number.isFinite(a.rect[k])&&a.rect[k]>=0&&a.rect[k]<=1)&&a.rect.x+a.rect.w<=1.001&&a.rect.y+a.rect.h<=1.001));
}
export function compactDraft(state, originalById){
 const edits={};for(const [id,e] of Object.entries(state.edits))if(e.text!==originalById.get(id).original||e.note||e.status!=='review')edits[id]={...e};
 return {schema:1,source:state.source,edits,reviews:structuredClone(state.reviews||{}),annotations:structuredClone(state.annotations||{}),submissionNote:state.submissionNote||''};
}
export function validVersion(v){
 return !!(v&&typeof v.id==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(v.id)&&typeof v.label==='string'&&v.label.length<=100&&typeof v.createdAt==='string'&&v.draft?.schema===1&&typeof v.draft.source==='string'&&v.draft.edits&&typeof v.draft.edits==='object'&&!Array.isArray(v.draft.edits)&&Object.values(v.draft.edits).every(e=>e&&typeof e.text==='string'&&e.text.length<=60000&&typeof e.note==='string'&&e.note.length<=12000&&['review','editing','ready'].includes(e.status))&&Object.values(v.draft.annotations||{}).every(validAnnotation));
}
