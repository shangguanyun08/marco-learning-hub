(function(root){
  'use strict';
  function sentences(article){
    const segmenter=new Intl.Segmenter('en',{granularity:'sentence'});
    return article.paragraphs.map((paragraph,p)=>Array.from(segmenter.segment(paragraph),({segment},i)=>({id:`p${p}s${i}`,text:segment})));
  }
  function quoteMarks(article,marks){
    const lookup=new Map(sentences(article).flat().map(s=>[s.id,s.text]));
    const valid=marks.filter(m=>lookup.has(m.sid)&&Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end>m.start&&m.end<=lookup.get(m.sid).length);
    const merged=[];
    for(const sid of new Set(valid.map(m=>m.sid))){
      const ranges=valid.filter(m=>m.sid===sid).map(m=>({sid,start:m.start,end:m.end})).sort((a,b)=>a.start-b.start);
      for(const m of ranges){const prev=merged.at(-1);if(prev?.sid===sid&&m.start<=prev.end)prev.end=Math.max(prev.end,m.end);else merged.push(m);}
    }
    return merged.map(m=>({...m,quote:lookup.get(m.sid).slice(m.start,m.end)})).filter(m=>m.quote.trim());
  }
  // Highlights are saved for human review, never automatically graded.
  // Ignore legacy evidenceOK flags without rewriting historical attempts.
  function passed(attempts){return !!attempts?.some(a=>a.checkedAt&&a.answerOK);}
  function resolved(attempts){return passed(attempts)||(attempts||[]).filter(a=>a.checkedAt).length>=2;}
  function finished(article,run){return article.questions.filter(q=>resolved(run?.answers[q.id])).length;}
  // First-pass completion is independent of accuracy and optional second tries.
  function answered(article,run){return article.questions.filter(q=>(run?.answers[q.id]||[]).some(a=>a.checkedAt&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.choices.length)).length;}
  function prepareRun(article,run){
    run.answers??={};run.drafts??={};
    for(const q of article.questions){
      const list=run.answers[q.id]||[],unchecked=list.filter(a=>!a.checkedAt).at(-1);
      if(unchecked){
        run.drafts[q.id]={choice:unchecked.choice,marks:quoteMarks(article,unchecked.marks||[])};
        run.answers[q.id]=list.filter(a=>a.checkedAt);
      }
      if(!run.drafts[q.id]){
        const previous=run.answers[q.id]?.at(-1);
        run.drafts[q.id]={choice:previous?.choice??null,marks:quoteMarks(article,previous?.marks||[])};
      }
    }
    return run;
  }
  function recordCheck(article,q,run,at){
    prepareRun(article,run);
    const list=run.answers[q.id]||[],draft=run.drafts[q.id];
    if(resolved(list)||!Number.isInteger(draft.choice)||draft.choice<0||draft.choice>=q.choices.length)return null;
    const marks=quoteMarks(article,draft.marks);
    if(!marks.length)return null;
    const checked={choice:draft.choice,answeredAt:at,marks,checkedAt:at,answerOK:draft.choice===q.answer,highlightAdded:true};
    (run.answers[q.id]??=[]).push(checked);
    run.drafts[q.id]={choice:draft.choice,marks:marks.map(m=>({...m})),updatedAt:at};
    if(finished(article,run)===article.questions.length)run.completedAt=at;
    return checked;
  }
  function scores(article,run){
    return {
      mastered:article.questions.filter(q=>passed(run?.answers[q.id])).length,
      firstAnswers:article.questions.filter(q=>run?.answers[q.id]?.[0]?.choice===q.answer).length,
      firstHighlights:article.questions.filter(q=>quoteMarks(article,run?.answers[q.id]?.[0]?.marks||[]).length>0).length,
      total:article.questions.length
    };
  }
  const api={sentences,quoteMarks,passed,resolved,finished,answered,prepareRun,recordCheck,scores};
  if(typeof module!=='undefined')module.exports=api;
  else root.ReadingCore=api;
})(typeof window==='undefined'?{}:window);
