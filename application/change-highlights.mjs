// Diff only the two fixed comparison sources. Drafts and storage are not involved.
const tokenize=text=>text.match(/\s+|[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\s]/gu)||[];
const whitespace=text=>/^\s+$/u.test(text);

export function changeSegments(original,suggested){
 const before=tokenize(original).filter(t=>!whitespace(t));
 const tokens=tokenize(suggested),after=tokens.map((text,index)=>({text,index})).filter(t=>!whitespace(t.text));
 // A longest common subsequence leaves matching words/punctuation unmarked,
 // including inside heavily rewritten paragraphs. Reordered text can be an edit.
 const lengths=Array.from({length:before.length+1},()=>new Uint32Array(after.length+1));
 for(let i=before.length-1;i>=0;i--)for(let j=after.length-1;j>=0;j--)
  lengths[i][j]=before[i]===after[j].text?lengths[i+1][j+1]+1:Math.max(lengths[i+1][j],lengths[i][j+1]);
 const unchanged=new Set();let i=0,j=0;
 while(i<before.length&&j<after.length){
  if(before[i]===after[j].text){unchanged.add(after[j].index);i++;j++;}
  else if(lengths[i+1][j]>=lengths[i][j+1])i++;else j++;
 }
 const changes=tokens.map((text,index)=>!whitespace(text)&&!unchanged.has(index));
 // Include spaces inside an edited phrase, without highlighting adjacent words.
 for(let k=1;k<tokens.length-1;k++)if(whitespace(tokens[k]))changes[k]=changes[k-1]&&changes[k+1];
 const segments=[];
 tokens.forEach((text,index)=>{
  const last=segments.at(-1),changed=changes[index];
  if(last&&last.changed===changed)last.text+=text;else segments.push({text,changed});
 });
 return segments;
}

export function changeParagraphs(original,suggested){
 const paragraphs=[[]];
 for(const segment of changeSegments(original,suggested))
  segment.text.split(/(\n\s*\n)/).forEach((text,index)=>{
   if(index%2)paragraphs.push([]);else if(text)paragraphs.at(-1).push({text,changed:segment.changed});
  });
 return paragraphs;
}
