(() => {
  "use strict";
  const cfg = window.lessonConfig;
  if (!cfg) return;

  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const allFields = cfg.groups.flatMap((group) => [group.original, group.similar].flatMap((panel) => panel.fields));
  const total = allFields.length;
  let state;
  try { state = JSON.parse(localStorage.getItem(cfg.storageKey) || "null"); } catch { state = null; }
  if (!state || state.version !== 2) state = {version:2, fields:{}, lastPracticed:null, completedAt:null};

  const normalize = (value) => String(value ?? "").trim().toLowerCase().replace(/[,$\s]/g, "");
  const answerText = (field) => field.answerLabel || (Array.isArray(field.answer) ? field.answer.join(", ") : String(field.answer));
  const isDone = (item) => item?.status === "correct" || item?.status === "revealed";
  const save = () => localStorage.setItem(cfg.storageKey, JSON.stringify(state));

  function mathHtml(text) {
    return esc(text)
      .replace(/(\d+)\/(\d+)/g, '<span class="frac" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>')
      .replaceAll("÷", '<span class="division-mark" aria-label="divided by">÷</span>');
  }

  function fieldHtml(field) {
    const type = field.type || "number";
    if (type === "choice" || type === "multi") {
      const inputType = type === "multi" ? "checkbox" : "radio";
      const choices = field.options.map((option) => `<label><input type="${inputType}" name="${esc(field.id)}" value="${esc(option.key)}"><b>${esc(option.key)}.</b><span>${esc(option.text)}</span></label>`).join("");
      return `<form class="answer-unit choice-form" data-field-id="${esc(field.id)}">${field.expression ? `<p class="calc-expression">${mathHtml(field.expression)}</p>` : ""}<div class="choice-list">${choices}</div><button type="submit">Check</button><p class="feedback" aria-live="polite">Two tries available.</p><p class="answer-reveal" hidden></p></form>`;
    }
    return `<form class="answer-unit" data-field-id="${esc(field.id)}">${field.expression ? `<p class="calc-expression">${mathHtml(field.expression)}</p>` : ""}<label class="answer-label" for="answer-${esc(field.id)}">${esc(field.label || "Answer")}</label><div class="answer-line"><input id="answer-${esc(field.id)}" type="text" inputmode="${type === "text" ? "text" : "numeric"}" autocomplete="off"><button type="submit">Check</button></div><p class="feedback" aria-live="polite">Two tries available.</p><p class="answer-reveal" hidden></p></form>`;
  }

  function figureHtml(figure) {
    if (!figure) return "";
    if (figure.type === "image") return `<figure class="figure-wrap"><div><img src="${esc(figure.src)}" alt="${esc(figure.alt || "Question figure")}"><figcaption>${esc(figure.caption || "")}</figcaption></div></figure>`;
    if (figure.type === "solid" || figure.type === "cubeRow") return `<figure class="figure-wrap"><canvas class="solid-canvas" width="520" height="340" data-drawing='${esc(JSON.stringify(figure))}' aria-label="${esc(figure.alt || "Math figure")}"></canvas></figure>`;
    if (figure.type === "coordinatePlane") return `<figure class="figure-wrap"><canvas class="coordinate-canvas" width="520" height="400" data-drawing='${esc(JSON.stringify(figure))}' aria-label="${esc(figure.alt || "Coordinate plane")}"></canvas><figcaption>${esc(figure.caption || "Each grid line marks 1 unit.")}</figcaption></figure>`;
    if (figure.type === "cellGrid") {
      const cells = Array.from({length:figure.rows * figure.cols}, (_,i) => `<span class="${figure.on.includes(i) ? "on" : ""}"></span>`).join("");
      return `<figure class="figure-wrap"><div class="cell-grid" style="grid-template-columns:repeat(${figure.cols},28px)">${cells}</div><figcaption>${esc(figure.caption || "Each shaded square has area 1.")}</figcaption></figure>`;
    }
    if (figure.type === "cellPair") {
      const boards = figure.boards.map((board, boardIndex) => {
        const cells = Array.from({length:board.rows * board.cols}, (_,i) => `<span class="${board.on.includes(i) ? "on" : ""}"></span>`).join("");
        return `<div><b>Figure ${boardIndex + 1}</b><div class="cell-grid" style="grid-template-columns:repeat(${board.cols},28px)">${cells}</div></div>`;
      }).join("");
      return `<figure class="figure-wrap"><div class="shape-card">${boards}</div><figcaption>Each shaded square has area 1.</figcaption></figure>`;
    }
    if (figure.type === "trapezoid") return `<figure class="figure-wrap"><div class="shape-card"><div class="shape trapezoid"><span class="top">${esc(figure.top)}</span><span class="bottom">${esc(figure.bottom)}</span><span class="height">h = ${esc(figure.height)}</span></div></div><figcaption>${esc(figure.caption || "Measurements are in grid units.")}</figcaption></figure>`;
    if (figure.type === "triangles") return `<figure class="figure-wrap"><div class="triangle-pieces">▲ ${esc(figure.full)} full triangles &nbsp; + &nbsp; ◭ ${esc(figure.halves)} half-triangles</div><figcaption>Two half-triangles make one full triangle.</figcaption></figure>`;
    return "";
  }

  function panelHtml(panel, kind) {
    return `<section class="question-panel ${kind}"><span class="panel-badge">${kind === "original" ? "Original missed question" : "New similar question"}</span><h2>${esc(panel.prompt)}</h2>${panel.note ? `<p class="hint">${esc(panel.note)}</p>` : ""}${figureHtml(panel.figure)}<div class="${panel.fields.length > 1 ? "answer-grid" : ""}">${panel.fields.map(fieldHtml).join("")}</div></section>`;
  }

  function render() {
    document.title = `Harry · Lesson ${cfg.lesson} Practice`;
    $("#nav-label").textContent = `ThinkAcademy · Lesson ${cfg.lesson}`;
    $("#lesson-eyebrow").textContent = `LESSON ${cfg.lesson} · ${cfg.topic.toUpperCase()}`;
    $("#lesson-title").innerHTML = cfg.titleHtml || "Original + <em>similar.</em>";
    $("#lesson-description").textContent = cfg.description;
    $("#record-date").textContent = `Recorded ${cfg.recordDate}`;
    $("#record-numbers").textContent = `Original questions ${cfg.recordNumbers}`;
    $("#score-total").textContent = total;
    $("#question-list").innerHTML = cfg.groups.map((group) => `<article class="problem-card" data-group="${esc(group.number)}"><header class="problem-header"><span class="question-number"><b>${esc(group.number)}</b> Question ${esc(group.number)} pair</span><span class="group-status">0% finished</span></header><div class="pair-grid">${panelHtml(group.original,"original")}${panelHtml(group.similar,"similar")}</div></article>`).join("");
    drawFigures();
    restoreForms();
    updateProgress();
  }

  function readValue(form, field) {
    if (field.type === "multi") return [...form.querySelectorAll("input:checked")].map((el) => el.value).sort().join(",");
    if (field.type === "choice") return form.querySelector("input:checked")?.value || "";
    return form.querySelector("input")?.value || "";
  }

  function setDisabled(form, disabled) {
    form.setAttribute("aria-disabled", String(disabled));
    form.querySelectorAll("input,button").forEach((el) => { el.disabled = disabled; });
  }

  function applyFormState(form, field, item) {
    form.classList.remove("is-correct","is-wrong","is-revealed");
    const feedback = form.querySelector(".feedback");
    const reveal = form.querySelector(".answer-reveal");
    reveal.hidden = true;
    if (!item) { setDisabled(form,false); feedback.textContent = "Two tries available."; return; }
    if (field.type === "choice" || field.type === "multi") {
      const selected = String(item.value || "").split(",");
      form.querySelectorAll("input").forEach((input) => { input.checked = selected.includes(input.value); });
    } else form.querySelector("input").value = item.value || "";
    if (item.status === "correct") {
      form.classList.add("is-correct"); feedback.textContent = item.firstTryCorrect ? "Correct on the first try! ★" : "Correct — you figured it out!"; setDisabled(form,true);
    } else if (item.status === "revealed") {
      form.classList.add("is-revealed"); feedback.textContent = "Let’s learn from this one."; reveal.innerHTML = `Answer: ${mathHtml(answerText(field))}`; reveal.hidden = false; setDisabled(form,true);
    } else {
      form.classList.add("is-wrong"); feedback.textContent = "Not yet. Calculate again — one try left."; setDisabled(form,false);
    }
  }

  function restoreForms() {
    allFields.forEach((field) => {
      const form = document.querySelector(`[data-field-id="${CSS.escape(field.id)}"]`);
      if (form) applyFormState(form, field, state.fields[field.id]);
    });
  }

  function updateProgress() {
    const finished = allFields.filter((field) => isDone(state.fields[field.id])).length;
    const firstTry = allFields.filter((field) => state.fields[field.id]?.firstTryCorrect === true).length;
    $("#finished-count").textContent = finished;
    $("#first-score").textContent = `${firstTry}/${total}`;
    $("#score-fill").style.width = `${(finished / total) * 100}%`;
    $("#last-practiced").textContent = state.lastPracticed ? `Last practiced ${new Date(state.lastPracticed).toLocaleDateString()}` : "Not practiced yet";
    cfg.groups.forEach((group) => {
      const fields = [group.original,group.similar].flatMap((panel) => panel.fields);
      const done = fields.filter((field) => isDone(state.fields[field.id])).length;
      const status = document.querySelector(`[data-group="${CSS.escape(String(group.number))}"] .group-status`);
      if (status) status.textContent = `${done}/${fields.length} finished`;
    });
    const complete = finished === total;
    if (complete && !state.completedAt) { state.completedAt = new Date().toISOString(); save(); }
    $("#completion-card").hidden = !complete;
    $("#final-score").textContent = `${firstTry}/${total} (${Math.round(firstTry / total * 100)}%)`;
  }

  $("#question-list").addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-field-id]");
    if (!form) return;
    event.preventDefault();
    const field = allFields.find((item) => item.id === form.dataset.fieldId);
    const value = readValue(form, field);
    if (!value) { form.querySelector(".feedback").textContent = "Choose or type an answer first."; return; }
    const expected = Array.isArray(field.answer) ? field.answer.slice().sort().join(",") : field.answer;
    const correct = normalize(value) === normalize(expected);
    const previous = state.fields[field.id] || {submissions:0,wrongAttempts:0,status:"pending",firstTryCorrect:null};
    if (isDone(previous)) return;
    const item = {...previous, value, submissions:previous.submissions + 1};
    if (previous.submissions === 0) item.firstTryCorrect = correct;
    if (correct) item.status = "correct";
    else { item.wrongAttempts = previous.wrongAttempts + 1; item.status = item.wrongAttempts >= 2 ? "revealed" : "pending"; }
    state.fields[field.id] = item;
    state.lastPracticed = new Date().toISOString();
    save(); applyFormState(form,field,item); updateProgress();
  });

  $("#reset-lesson").addEventListener("click", () => {
    if (!confirm(`Reset all Lesson ${cfg.lesson} practice and its first-try score?`)) return;
    localStorage.removeItem(cfg.storageKey); location.reload();
  });

  function drawFigures() {
    document.querySelectorAll("canvas[data-drawing]").forEach((canvas) => {
      const d = JSON.parse(canvas.dataset.drawing); const ctx = canvas.getContext("2d");
      ctx.clearRect(0,0,520,340); ctx.lineWidth=5; ctx.strokeStyle="#172f61"; ctx.fillStyle="#dce7ff"; ctx.lineJoin="round";
      if (d.type === "coordinatePlane") {
        ctx.clearRect(0,0,520,400); const maxX=d.maxX||10,maxY=d.maxY||10,s=Math.min(28,260/maxX,260/maxY),ox=78,oy=342;
        ctx.lineWidth=1.5; ctx.strokeStyle="#a9d9ef"; ctx.font="600 16px Segoe UI"; ctx.textAlign="center"; ctx.textBaseline="middle";
        for(let i=0;i<=maxX;i++){const x=ox+i*s;ctx.beginPath();ctx.moveTo(x,oy);ctx.lineTo(x,oy-maxY*s);ctx.stroke();ctx.fillStyle="#52637d";ctx.fillText(String(i),x,oy+20);}
        for(let i=0;i<=maxY;i++){const y=oy-i*s;ctx.beginPath();ctx.moveTo(ox,y);ctx.lineTo(ox+maxX*s,y);ctx.stroke();ctx.fillStyle="#52637d";if(i>0)ctx.fillText(String(i),ox-22,y);}
        ctx.lineWidth=4;ctx.strokeStyle="#172f61";ctx.beginPath();ctx.moveTo(ox,oy-maxY*s-18);ctx.lineTo(ox,oy+4);ctx.lineTo(ox+maxX*s+18,oy+4);ctx.stroke();
        if(d.connect && (d.points||[]).length>1){ctx.beginPath();d.points.forEach((p,i)=>{const x=ox+p.x*s,y=oy-p.y*s;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});if(d.points.length>2)ctx.closePath();ctx.lineWidth=3;ctx.strokeStyle="#4255ff";ctx.stroke();}
        (d.points||[]).forEach((p)=>{const x=ox+p.x*s,y=oy-p.y*s;ctx.beginPath();ctx.fillStyle=p.color||"#f05a28";ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.font="italic 700 21px Georgia";ctx.fillStyle="#172f61";ctx.fillText(p.label,x+16,y-14);});
        return;
      }
      if (d.type === "cubeRow") {
        const size = Math.min(74,350/d.count), depth=30, start=(520-(d.count*size+depth))/2, y=135;
        for(let i=0;i<d.count;i++){const x=start+i*size;ctx.fillStyle="#eaf0ff";ctx.fillRect(x,y,size,size);ctx.strokeRect(x,y,size,size);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+depth,y-depth);ctx.lineTo(x+size+depth,y-depth);ctx.lineTo(x+size,y);ctx.moveTo(x+size,y);ctx.lineTo(x+size+depth,y-depth);ctx.lineTo(x+size+depth,y+size-depth);ctx.lineTo(x+size,y+size);ctx.stroke();}
        ctx.font="700 25px Segoe UI";ctx.fillStyle="#172f61";ctx.fillText(d.label || `${d.count} equal cubes`,170,285);return;
      }
      const kind=d.kind, ox=145,oy=105,w=210,h=130,dx=55,dy=-42;
      ctx.fillStyle="#edf3ff";
      if(kind==="cylinder"){ctx.beginPath();ctx.ellipse(260,105,100,35,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(160,105);ctx.lineTo(160,235);ctx.moveTo(360,105);ctx.lineTo(360,235);ctx.stroke();ctx.beginPath();ctx.ellipse(260,235,100,35,0,0,Math.PI*2);ctx.fill();ctx.stroke();return;}
      if(kind==="sphere"){ctx.beginPath();ctx.arc(260,170,100,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(260,170,100,35,0,0,Math.PI*2);ctx.stroke();return;}
      if(kind==="tri-prism"){ctx.beginPath();ctx.moveTo(145,235);ctx.lineTo(240,75);ctx.lineTo(335,235);ctx.closePath();ctx.moveTo(200,193);ctx.lineTo(295,33);ctx.lineTo(390,193);ctx.closePath();ctx.moveTo(145,235);ctx.lineTo(200,193);ctx.moveTo(240,75);ctx.lineTo(295,33);ctx.moveTo(335,235);ctx.lineTo(390,193);ctx.stroke();return;}
      if(kind==="pent-prism"){const poly=(cx,cy)=>{ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5,x=cx+78*Math.cos(a),y=cy+78*Math.sin(a);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();};poly(215,170);poly(305,135);for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;ctx.beginPath();ctx.moveTo(215+78*Math.cos(a),170+78*Math.sin(a));ctx.lineTo(305+78*Math.cos(a),135+78*Math.sin(a));ctx.stroke();}return;}
      ctx.fillRect(ox,oy,w,h);ctx.strokeRect(ox,oy,w,h);ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+dx,oy+dy);ctx.lineTo(ox+w+dx,oy+dy);ctx.lineTo(ox+w,oy);ctx.moveTo(ox+w,oy);ctx.lineTo(ox+w+dx,oy+dy);ctx.lineTo(ox+w+dx,oy+h+dy);ctx.lineTo(ox+w,oy+h);ctx.stroke();
      if(kind==="cube"){ctx.font="700 22px Segoe UI";ctx.fillStyle="#172f61";ctx.fillText("all edges equal",185,285);}
    });
  }

  render();
})();
