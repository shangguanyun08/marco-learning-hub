/* Stable, skill-matched banks: one distinct set of 10 for each Day 3 question.
   Keep bank order stable because saved attempts refer to their position. */
(function installDay3Mastery(global) {
  "use strict";
  const LIMIT = 10;
  const TARGET = 3;

  function choicesWith(answer, distractors, position) {
    const choices = [...distractors];
    choices.splice(position % 4, 0, answer);
    return choices;
  }

  function arithmetic(parent, pairs) {
    return pairs.map(([left, right], index) => {
      const result = parent.operator === "×" ? left * right
        : parent.operator === "÷" ? left / right
        : parent.operator === "+" ? left + right : left - right;
      const answer = Number(result.toFixed(6));
      const question = { left, right, operator: parent.operator, skill: parent.skill, answer };
      if (parent.choices) {
        question.choices = choicesWith(answer,
          [Number((answer * 10).toFixed(6)), Number((answer / 10).toFixed(6)), Number((left + right).toFixed(6))], index);
      }
      return question;
    });
  }

  function decimalFractions(rows) {
    return rows.map(([decimal, answer, ...distractors], index) => ({
      prompt: `Which fraction is equal to ${decimal}?`, decimal, answer,
      choices: choicesWith(answer, distractors, index),
      skill: "Decimal to Fraction", kind: "decimalFraction",
    }));
  }

  function placeValues(rows) {
    return rows.map(([number, digit, answer], index) => ({
      prompt: `In what place is the digit ${digit} in ${number}?`, answer,
      choices: choicesWith(answer, ["ones", "tenths", "hundredths", "thousandths"].filter(value => value !== answer), index),
      accepted: [answer.slice(0, -1), `${answer} place`, `${answer.slice(0, -1)} place`],
      skill: "Decimal Place Value", kind: "placeValue",
    }));
  }

  function createBanks(parents) {
    return [
      arithmetic(parents[0], [[324,3],[316,3],[342,3],[329,3],[351,3],[337,3],[362,3],[348,3],[375,3],[386,3]]),
      arithmetic(parents[1], [[426,4],[413,4],[438,4],[421,4],[457,4],[432,4],[469,4],[446,4],[473,4],[485,4]]),
      arithmetic(parents[2], [[247,3],[228,3],[253,3],[219,3],[264,3],[237,3],[281,3],[246,3],[275,3],[298,3]]),
      arithmetic(parents[3], [[815,5],[925,5],[765,5],[855,5],[935,5],[785,5],[965,5],[875,5],[725,5],[895,5]]),
      arithmetic(parents[4], [[826,2],[948,2],[762,2],[894,2],[956,2],[738,2],[982,2],[854,2],[918,2],[974,2]]),
      arithmetic(parents[5], [[358,426],[476,319],[287,458],[569,247],[638,185],[394,268],[457,376],[685,238],[729,164],[548,287]]),
      arithmetic(parents[6], [[820,347],[940,468],[730,285],[860,397],[920,576],[750,368],[810,457],[960,684],[870,496],[930,578]]),
      arithmetic(parents[7], [[703,286],[802,457],[604,278],[905,568],[701,384],[803,496],[602,275],[904,687],[706,489],[801,563]]),
      decimalFractions([
        [0.2,"1/5","1/2","2/100","2/5"], [0.6,"3/5","1/6","3/10","6/100"],
        [0.8,"4/5","1/8","8/100","3/5"], [0.3,"3/10","1/3","3/5","3/100"],
        [0.7,"7/10","1/7","7/100","3/10"], [0.9,"9/10","1/9","9/100","1/10"],
        [0.1,"1/10","1/100","1/5","1/2"], [0.5,"1/2","1/5","5/100","3/5"],
        [0.25,"1/4","1/25","1/2","3/4"], [0.75,"3/4","1/4","3/5","7/10"],
      ]),
      decimalFractions([
        [0.15,"3/20","3/10","1/5","15/1000"], [0.35,"7/20","7/10","3/5","35/1000"],
        [0.45,"9/20","9/10","4/5","45/1000"], [0.55,"11/20","11/10","1/2","55/1000"],
        [0.65,"13/20","13/10","3/5","65/1000"], [0.85,"17/20","17/10","4/5","85/1000"],
        [0.95,"19/20","19/10","9/10","95/1000"], [0.05,"1/20","1/5","1/2","1/200"],
        [0.12,"3/25","3/5","1/2","12/1000"], [0.32,"8/25","8/5","3/2","32/1000"],
      ]),
      placeValues([
        ["438.72",7,"tenths"],["265.39",9,"hundredths"],["719.486",6,"thousandths"],
        ["853.16",3,"ones"],["642.95",9,"tenths"],["317.264",6,"hundredths"],
        ["584.731",1,"thousandths"],["926.48",6,"ones"],["173.85",8,"tenths"],["492.307",0,"hundredths"],
      ]),
      placeValues([
        ["527.046",4,"hundredths"],["864.309",9,"thousandths"],["193.572",5,"tenths"],
        ["746.028",6,"ones"],["352.681",8,"hundredths"],["918.237",7,"thousandths"],
        ["463.059",0,"tenths"],["285.714",5,"ones"],["679.403",0,"hundredths"],["831.526",6,"thousandths"],
      ]),
      arithmetic(parents[12], [[0.52,0.2],[0.34,0.2],[0.61,0.2],[0.47,0.2],[0.56,0.2],[0.38,0.2],[0.72,0.2],[0.49,0.2],[0.63,0.2],[0.81,0.2]]),
      arithmetic(parents[13], [[0.41,0.3],[0.52,0.3],[0.36,0.3],[0.64,0.3],[0.27,0.3],[0.58,0.3],[0.73,0.3],[0.46,0.3],[0.69,0.3],[0.82,0.3]]),
    ].slice(0, parents.length);
  }

  function progress(record) {
    const attempts = record.review?.attempts || [];
    let streak = record.firstTry === true ? 1 : 0;
    for (const attempt of attempts) streak = attempt.correct ? streak + 1 : 0;
    const status = record.firstTry === null || record.firstTry === undefined ? "unanswered"
      : streak >= TARGET ? "mastered"
      : attempts.length >= LIMIT ? "unmastered" : "practicing";
    return { status, streak, used: attempts.length, finished: status === "mastered" || status === "unmastered" };
  }

  function normalizeReview(value, bank, check, firstTry = false) {
    const attempts = [];
    let streak = firstTry === true ? 1 : 0;
    for (const item of Array.isArray(value?.attempts) ? value.attempts.slice(0, LIMIT) : []) {
      if (typeof item?.answer !== "string" || !item.answer.trim()) break;
      const correct = check(item.answer, bank[attempts.length]);
      attempts.push({ answer: item.answer, correct });
      streak = correct ? streak + 1 : 0;
      if (streak === TARGET) break;
    }
    return { attempts, ready: attempts.length === 0 || value?.ready === true };
  }

  function submit(record, answer, bank, check) {
    const state = progress(record);
    if (state.status !== "practicing" || !String(answer).trim() || record.review?.ready === false) return false;
    record.review ||= { attempts: [], ready: true };
    record.review.attempts.push({ answer, correct: check(answer, bank[state.used]) });
    record.review.ready = false;
    if (progress(record).status === "mastered") record.solved = true;
    return true;
  }

  function next(record) {
    if (progress(record).status !== "practicing" || record.review?.ready !== false) return false;
    record.review.ready = true;
    return true;
  }

  global.HarryDay3Mastery = { LIMIT, TARGET, createBanks, progress, normalizeReview, submit, next };
})(globalThis);
