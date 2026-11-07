import {comparisonQuestion as earlierQuestion} from './revision-v2.mjs?v=20261101-v2sync2';

// Version 3 applies the family's completed-event account saved on November 7.
// The counselor's original, Versions 1 and 2, and the working draft stay separate.
export const revisionV3 = {
 'q3-p3': `This November, Marco and I participated in the Rocks of Encouragement project at Love Irvine's Serve Day. He painted rocks with sunshine, Santa Claus, and pumpkin designs, hoping to bring cheer to local seniors. He enjoyed the painting and was happy to see so many children around his age coming together for the same purpose. At Sage Hill, we hope to continue contributing our time to school events, student activities, and community service wherever we can be useful.`
};

export const revisionV3Notes = {
 'q3-p3': [
  ['Your November 7 update included', 'The activity has now happened. Version 3 replaces the plan with your account of attending with Marco, the sunshine, Santa Claus, and pumpkin designs he painted, and his enjoyment of joining children around his age to bring cheer to seniors.'],
  ['Completed activity and accurate scope', 'The paragraph now uses past tense and says “Marco and I,” rather than claiming the whole family attended. It keeps the Sage Hill volunteering conclusion. Your note describes the hope of cheering seniors, so the revision does not claim the rocks were delivered or describe a reaction from recipients.']
 ]
};

export function comparisonQuestion(question, version = 'v3') {
 if (version === 'v1' || version === 'v2') return earlierQuestion(question, version);
 const previous = earlierQuestion(question, 'v2');
 return {...previous, paragraphs: previous.paragraphs.map(p => ({
  ...p,
  suggested: revisionV3[p.id] ?? p.suggested,
  notes: revisionV3Notes[p.id] || p.notes
 }))};
}
