import { CARDS } from './cards.js';
import { SPREADS, TOPICS, shuffleDeck, validateQuestion, makeReading, formatReading, birthCards } from './engine.js?v=1.1.0';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CARD_MAP = new Map(CARDS.map(c => [c.id, c]));
const image = id => globalThis.CARD_IMAGES?.[id] || `assets/cards/${id}.webp`;
const main = $('#main');
const dialog = $('#modal');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const KEYS = { settings: 'byeolgyeol.settings.v1', history: 'byeolgyeol.readings.v1' };
let storageAvailable = true;
function readStorage(key, fallback) { try { const raw=localStorage.getItem(key);storageAvailable=true;if(!raw)return fallback;try{return JSON.parse(raw);}catch{return fallback;} } catch { storageAvailable = false; return fallback; } }
function writeStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value));storageAvailable=true; return true; } catch { storageAvailable = false; return false; } }
const rawSettings = readStorage(KEYS.settings, {});
const settings = {deck: rawSettings?.deck === 'major' ? 'major' : 'full', reversed: rawSettings?.reversed === true, motion: ['normal','quick','off'].includes(rawSettings?.motion) ? rawSettings.motion : 'normal'};
function validReading(r) { if(!r || typeof r!=='object' || !Array.isArray(r.entries) || r.entries.some(c=>!c||typeof c!=='object'))return false; return typeof r.id === 'string' && typeof r.question === 'string' && r.question.length <= 2000 && typeof r.date === 'string' && !Number.isNaN(Date.parse(r.date)) && typeof r.summary === 'string' && typeof r.focus === 'string' && typeof r.reflection === 'string' && SPREADS.some(s => s.id === r.spreadId) && r.entries.length === SPREADS.find(s => s.id === r.spreadId).count && new Set(r.entries.map(c => c.id)).size === r.entries.length && r.entries.every(c => CARD_MAP.has(c.id) && typeof c.reversed === 'boolean' && ['name','english','positionName','positionMeaning','cardMeaning','interpretation','advice'].every(k => typeof c[k] === 'string') && Array.isArray(c.keywords) && c.keywords.every(k => typeof k === 'string')); }
function loadReadings() {
  const history = readStorage(KEYS.history, []);
  return (Array.isArray(history) ? history : []).filter(validReading).slice(0,40).map(reading => ({
    ...reading,
    followups: Array.isArray(reading.followups) ? reading.followups.filter(validReading) : []
  }));
}

let readings = loadReadings();
let persistedIds = new Set(readings.map(r=>r.id));

function syncReadings(saved) {
  readings = saved;
  persistedIds = new Set(saved.map(r=>r.id));
  updateCount();
}

async function changeReadings(change) {
  const write = () => {
    const latest = loadReadings();
    if(!storageAvailable) return false;
    const next = change(latest).slice(0,40);
    if(!writeStorage(KEYS.history,next)) return false;
    syncReadings(next);
    return true;
  };
  // Serialize read/modify/write across tabs when Web Locks is available.
  const locks = navigator.locks;
  return locks ? locks.request(KEYS.history,write) : write();
}

const state = { view:'home', followup:false, followupOpen:false, followupQuestion:'', question:'', topic:'general', spreadId:null, shuffleMode:'overhand', deck:[], selected:[], busy:false, shuffled:false, shuffleCount:0, activeCard:null, revealed:0, reading:null, saved:false, hideQuestion:false, libraryFilter:'all', librarySearch:'', birthInput:'', birthResult:null };
let toastTimer;
const arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const backArrow = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M19 12H5m5-5-5 5 5 5"/></svg>';
const closeIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const copyIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>';
const shareIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
const backMark = '<span class="back-mark" aria-hidden="true"><span>✧</span></span>';
function backCard(extra='') { return `<div class="card-back ${extra}" aria-hidden="true">${backMark}</div>`; }
function dateText(date, includeTime=false) { return new Intl.DateTimeFormat('ko-KR', {year:'numeric',month:'long',day:'numeric',...(includeTime ? {hour:'2-digit',minute:'2-digit'} : {})}).format(new Date(date)); }
function todayString() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function duration(ms) { return settings.motion === 'off' || reducedMotion.matches ? 0 : Math.round(ms * (settings.motion === 'quick' ? .55 : 1)); }
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200); }
function announce(message) { $('#live-region').textContent=''; requestAnimationFrame(()=>$('#live-region').textContent=message); }
function applySettings() { document.documentElement.classList.toggle('no-motion',settings.motion==='off');document.documentElement.classList.toggle('quick-motion',settings.motion==='quick'); document.documentElement.style.setProperty('--duration',settings.motion==='quick'?'350ms':'650ms'); }
function updateCount() { $('#history-count').textContent=readings.length ? readings.length : ''; }
function spread() { return SPREADS.find(s=>s.id===state.spreadId)||SPREADS.find(s=>s.id==='timeline'); }
function renderNav() { const active=['shuffle','pick','reveal','result'].includes(state.view)?'home':state.view; $$('.main-nav [data-nav]').forEach(a=>{if(a.dataset.nav===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}); }
function setView(view,{scroll=true}={}) { state.view=view; state.activeCard=null; render(); const hashes={home:'reading',birth:'birth',library:'library',history:'history'}; if(hashes[view])history.replaceState(null,'',`#${hashes[view]}`); if(scroll)window.scrollTo({top:0,behavior:'instant'}); }
function render() { renderNav(); const screens={home:renderHome,shuffle:renderShuffle,pick:renderPick,reveal:renderReveal,result:renderResult,birth:renderBirth,library:renderLibrary,history:renderHistory}; main.innerHTML=(screens[state.view]||renderHome)(); if(state.view==='library')updateLibrary(); updateCount(); }
function artCard(id, cls) { const c=CARD_MAP.get(id); return `<div class="hero-card ${cls}"><img src="${image(id)}" width="500" height="870" alt="${e(c.name)} 타로 카드" fetchpriority="high"></div>`; }
function layoutStyle(s) { return `--cols:${s.columns};--rows:${s.rows};--count:${s.count}`; }
function cellStyle(s,i) { const cell=s.cells[i];return `grid-column:${cell.col};grid-row:${cell.row}`; }
function layoutDiagram(s,{large=false}={}) { return `<div class="layout-diagram ${large?'large':'mini'}" data-layout="${s.layout}" style="${layoutStyle(s)}" role="img" aria-label="${e(s.layoutName)}. ${s.positions.map((p,i)=>`${i+1}번 ${e(p.name)}`).join(', ')}">${s.positions.map((p,i)=>`<span class="diagram-place" style="${cellStyle(s,i)}"><span class="diagram-card">${i+1}</span>${large?`<span class="diagram-label">${e(p.name)}</span>`:''}</span>`).join('')}</div>`; }
function spreadBrief(s) { return `<div class="spread-brief-figure">${layoutDiagram(s,{large:true})}</div><div class="spread-brief-copy"><p class="spread-layout-name">${e(s.layoutName)} · ${s.count}장</p><h3>${e(s.name)}</h3><p>${e(s.layoutDescription)}</p><p class="spread-example">이런 질문에 &nbsp; “${e(s.question)}”</p><p class="spread-order">${s.positions.map((p,i)=>`${i+1}. ${e(p.name)}`).join(' → ')}</p><div class="spread-brief-actions"><button class="btn primary small" data-action="go-question">이 배열로 질문하기 ↓</button><button class="text-button" data-action="spread-info">자리별 뜻 자세히 ${arrow}</button></div></div>`; }
function deckSummary(s) {
  return s ? `${settings.deck === 'major' ? '메이저 22장' : '전체 78장'} 중 ${s.count}장을 뽑아요` : '';
}

function readingSettings(s) {
  const options = (key, title, choices, value, help = '') => `<fieldset><legend>${title}</legend><div class="reading-options">${choices.map(([id, label]) =>
    `<label><input type="radio" name="reading-${key}" data-reading-setting="${key}" value="${id}" ${id === value ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div>${help ? `<p class="reading-setting-help">${help}</p>` : ''}</fieldset>`;
  return `<section class="reading-settings" aria-label="리딩 설정">
    <div class="reading-settings-head"><strong>리딩 설정</strong><span id="deck-summary" aria-live="polite">${deckSummary(s)}</span></div>
    <div class="reading-settings-grid">
      ${options('deck','사용할 카드',[['full','전체 78장'],['major','메이저 22장']],settings.deck,'전체 78장은 큰 흐름을 보는 메이저 22장과 일상의 상황을 보는 마이너 56장을 모두 써요. 메이저 22장은 질문의 큰 주제에 집중하고 싶을 때 골라보세요.')}
      ${options('direction','카드 방향',[['upright','정방향만'],['reversed','역방향 포함']],settings.reversed ? 'reversed' : 'upright','정방향만 고르면 카드의 기본 의미로 읽어요. 역방향을 포함하면 뒤집혀 나온 카드를 지연, 부족함, 지나침 등 다른 관점에서 읽을 수 있어요.')}
    </div>
    <div class="reading-motion">
      ${options('motion','카드 움직임',[['normal','기본'],['quick','빠르게'],['off','끄기']],settings.motion)}
    </div>
  </section>`;
}

function renderHome() {
  const s=SPREADS.find(s=>s.id===state.spreadId);
  return `<div class="shell home-v2"><section class="spread-first" aria-labelledby="spreads-title"><div class="section-heading"><div><p class="eyebrow">01 · CHOOSE YOUR SPREAD</p><h1 id="spreads-title">어떤 시선으로 바라볼까요?</h1><p>먼저 장수와 배치를 골라주세요. 자리의 의미가 카드의 이야기를 바꿉니다.</p></div><button class="text-button" data-action="guide">배열이 처음이라면 ${arrow}</button></div><div class="spread-options">${SPREADS.map((sp,i)=>`<button class="spread-option ${sp.id===state.spreadId?'selected':''}" data-spread="${sp.id}" aria-pressed="${sp.id===state.spreadId}" aria-describedby="spread-example-${sp.id}"><span class="spread-number">${sp.count}장 · ${e(sp.layoutName)}</span>${layoutDiagram(sp)}<h3>${e(sp.name)}</h3><p>${e(sp.subtitle)}</p>${sp.id===state.spreadId?'<span class="selected-check" aria-hidden="true">✓</span>':''}<span id="spread-example-${sp.id}" class="sr-only">${e(sp.question)}</span></button>`).join('')}</div><div id="spread-brief" class="spread-brief ${s?'chosen':''}" aria-live="polite">${s?spreadBrief(s):'<p class="spread-placeholder">✧ &nbsp; 위에서 배열을 고르면 배치 그림, 뽑는 순서와 질문 예시를 보여드릴게요.</p>'}</div></section><section class="home-hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">02 · ASK YOUR QUESTION</p><h2 id="hero-title">마음이 머무는 곳에,<br><em>질문을 놓아보세요.</em></h2><p class="hero-description">카드를 섞기 전, 나에게 귀 기울이는 시간.<br>지금 살펴보고 싶은 이야기를 적어주세요.</p><form id="question-form" novalidate><label class="question-label" for="question">지금, 어떤 이야기가 궁금한가요?</label><div class="question-box"><textarea id="question" name="question" maxlength="240" placeholder="예) 새로운 일을 시작하려는 나에게 필요한 조언은?" aria-describedby="question-error question-hint">${e(state.question)}</textarea><div class="question-bottom"><button type="button" data-action="example">질문 예시 넣기 ↗</button><span id="question-counter">${[...state.question].length} / 240</span></div></div><p id="question-error" class="field-error" role="alert"></p><p id="question-hint" class="sr-only">질문을 240자 이내로 적고 주제와 배열을 선택해 주세요.</p><div class="topic-chips" aria-label="질문의 주제">${TOPICS.map(t=>`<button type="button" class="chip ${state.topic===t.id?'active':''}" data-topic="${t.id}" aria-pressed="${state.topic===t.id}">${e(t.name)}</button>`).join('')}</div><div class="cta-row"><button id="draw-submit" class="btn primary" type="submit" ${s?'':'disabled'}>${s?`${s.count}장 카드 뽑기`:'배열을 먼저 골라주세요'} ${arrow}</button><div class="selected-note">선택한 배열<strong id="selected-spread-note">${s?`${e(s.name)} · ${e(s.layoutName)}`:'아직 선택하지 않았어요'}</strong></div></div>${readingSettings(s)}</form></div><div class="celestial-scene" aria-label="별, 달, 태양 카드"><div class="orbit"></div><div class="orbit outer"></div><span class="scene-top">AS ABOVE, SO WITHIN</span><span class="scene-spark spark1" aria-hidden="true">✧</span><span class="scene-spark spark2" aria-hidden="true">✦</span><span class="scene-spark spark3" aria-hidden="true">✧</span><span class="scene-corner corner1"></span><span class="scene-corner corner2"></span>${artCard('m18','card-left')}${artCard('m19','card-right')}${artCard('m17','card-center')}<div class="scene-label">THE MOON · THE STAR · THE SUN<span>내 안의 작은 우주를 만나는 시간</span></div></div></section><div class="home-bottom"><a class="quiet-link" href="#birth" data-nav="birth"><span class="quiet-icon" aria-hidden="true">☾</span><div><h3>내 생일에 담긴 카드</h3><p>메이저 아르카나로 만나는 또 다른 나</p></div><span class="arrow">${arrow}</span></a><a class="quiet-link" href="#library" data-nav="library"><span class="quiet-icon" aria-hidden="true">✧</span><div><h3>카드의 언어를 배워보세요</h3><p>78장의 상징과 정·역방향 이야기</p></div><span class="arrow">${arrow}</span></a></div></div>`;
}
function updateSpreadChoice(id) { const sp=SPREADS.find(s=>s.id===id);if(!sp)return;state.spreadId=id;$$('[data-spread]').forEach(el=>{const on=el.dataset.spread===id;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',on);$('.selected-check',el)?.remove();if(on)el.insertAdjacentHTML('beforeend','<span class="selected-check" aria-hidden="true">✓</span>');});$('#selected-spread-note').textContent=`${sp.name} · ${sp.layoutName}`;$('#spread-brief').classList.add('chosen');$('#spread-brief').innerHTML=spreadBrief(sp);$('#draw-submit').disabled=false;$('#draw-submit').innerHTML=`${sp.count}장 카드 뽑기 ${arrow}`;$('#deck-summary').textContent=deckSummary(sp);announce(`${sp.name}, ${sp.layoutName}, ${sp.count}장 배열을 골랐어요.`); }
function steps(active) { return `<div class="progress-steps" aria-label="진행 단계">${['배열·질문','섞기','고르기','펼쳐보기'].map((t,i)=>`${i?'<i aria-hidden="true"></i>':''}<span data-step="${i+1}" class="${i===active?'active':''}" ${i===active?'aria-current="step"':''}>${t}</span>`).join('')}</div>`; }
function questionStrip() { const deckMode=state.deck.length?(state.sessionDeck||settings.deck):settings.deck;const reversal=state.deck.length?(state.sessionReversed??settings.reversed):settings.reversed;return `<div class="question-strip"><div><span>마음에 품은 질문</span>${e(state.question)}</div><div>${e(spread().name)}<span>${deckMode==='major'?'메이저 22장':'전체 78장'} · ${reversal?'정·역방향':'정방향'}</span></div></div>`; }
function renderShuffle() { return `<div class="shell page page-narrow">${steps(1)}${questionStrip()}<div class="stage-heading"><h2>마음을 모아, 카드를 섞어요.</h2><p>편안한 방식을 고르세요. 원하는 만큼 다시 섞어도 괜찮아요.</p></div><div class="shuffle-options" aria-label="셔플 방식">${[['overhand','작은 묶음으로','오버핸드'],['riffle','두 묶음을 교차해','리플'],['wash','넓게 펼쳐','워시']].map(([id,label,name])=>`<button class="shuffle-option ${state.shuffleMode===id?'active':''}" data-shuffle-mode="${id}" aria-pressed="${state.shuffleMode===id}">${label} · ${name}</button>`).join('')}</div><div class="shuffle-stage" data-mode="${state.shuffleMode}" aria-hidden="true">${Array.from({length:12},(_,i)=>`<div class="card-back pack-card" style="--i:${i};--side:${i%2?1:-1};--x:${Math.round(Math.sin(i*2.2)*160)};--y:${Math.round(Math.cos(i*2.5)*45)};--r:${Math.round(Math.sin(i*1.3)*55)}">${backMark}</div>`).join('')}</div><div class="stage-actions"><button class="btn ${state.shuffled?'ghost':'primary'}" data-action="shuffle">${state.shuffled?'다시 섞기':'셔플 시작'} <span aria-hidden="true">⤨</span></button><button class="btn ghost" data-action="cut" ${state.shuffled?'':'disabled'}>카드 나누기</button><button class="btn ${state.shuffled?'primary':''}" data-action="start-pick" ${state.shuffled?'':'disabled'}>카드 고르기 ${arrow}</button></div><p class="stage-hint" id="shuffle-hint">${state.shuffled?`${state.shuffleCount}번 섞었어요. 준비가 되면 카드를 골라보세요.`:'셔플을 시작하면 카드 순서가 새롭게 섞여요.'}</p><div class="stage-hint"><button class="text-button" data-action="back-question">${backArrow} 질문과 배열 바꾸기</button></div></div>`; }
function slotHtml(i) { const s=spread();const p=s.positions[i];const filled=i<state.selected.length;return `<div class="spread-slot" style="${cellStyle(s,i)}"><div class="slot-card ${filled?'filled':''}" id="slot-${i}">${filled?backCard():String(i+1).padStart(2,'0')}</div><div class="slot-label"><b>${i+1}번째 카드</b>${e(p.name)}</div></div>`; }
function wheelPoint(angle, radius) {
  const radians = angle * Math.PI / 180;
  return [50 + radius * Math.sin(radians), 50 - radius * Math.cos(radians)];
}

function nextCardText() {
  return spread().positions[state.selected.length]?.name || '선택 완료';
}

function renderWheel() {
  const count = state.deck.length;
  const step = 360 / count;
  return `<div class="deck-wheel" role="group" aria-label="원형 카드 덱" aria-describedby="pick-instruction">
    ${state.deck.map((_, index) => {
      const angle = index * step;
      const [x, y] = wheelPoint(angle, 38);
      // Each card has a fixed wedge, so a raised card cannot steal its neighbor's input.
      const left = angle - step / 2;
      const right = angle + step / 2;
      const hit = [wheelPoint(left, 28), wheelPoint(left, 48), wheelPoint(right, 48), wheelPoint(right, 28)]
        .map(([px, py]) => `${px}% ${py}%`).join(',');
      return `<button type="button" class="wheel-hit" data-deck-index="${index}" style="--hit:polygon(${hit})"
        aria-label="뒷면 카드 ${index+1}" aria-pressed="false"></button>
        <div class="wheel-face" data-wheel-back="${index}" aria-hidden="true" style="left:${x}%;top:${y}%;--angle:${angle}deg;--fan-delay:${index*3}ms">
          <button type="button" tabindex="-1" class="card-back wheel-back" data-confirm-card="${index}">${backMark}</button>
        </div>`;
    }).join('')}
    <div class="wheel-center"><strong id="draw-count">${state.selected.length} / ${spread().count}장 선택</strong><span id="wheel-next">${e(nextCardText())}</span></div>
  </div>`;
}

function renderPick() { const s=spread();return `<div class="shell page pick-page">${steps(2)}${questionStrip()}<div class="stage-heading"><h2>원 안에서 마음이 가는 카드를 골라요.</h2><p id="pick-instruction">카드를 한 번 누르면 살짝 나와요. 같은 카드를 다시 눌러 선택하세요.</p></div><div class="picking-workspace"><section class="placement-panel" aria-label="${e(s.layoutName)} 카드 배치"><div class="placement-heading"><span>${e(s.layoutName)}</span><button class="text-button" data-action="spread-info">자리 설명 ⓘ</button></div><div class="spread-slots has-layout" data-layout="${s.layout}" style="${layoutStyle(s)}" aria-label="선택한 카드 자리">${s.positions.map((_,i)=>slotHtml(i)).join('')}</div><p class="next-position" id="next-position">${state.selected.length<s.count?`다음은 ${state.selected.length+1}번 · ${e(s.positions[state.selected.length].name)}<span>${e(s.positions[state.selected.length].meaning)}</span>`:'모든 자리를 채웠어요. 이제 카드를 펼쳐보세요.'}</p></section><section class="all-cards-panel" aria-label="${state.deck.length}장 전체 카드"><div id="card-wheel">${renderWheel()}</div></section></div><div class="stage-actions"><button class="btn ghost" data-action="repick">처음부터 다시 섞기</button><button class="btn primary" data-action="start-reveal" ${state.selected.length===s.count?'':'disabled'}>선택한 카드 펼치기 ${arrow}</button></div><p class="stage-hint">1번부터 차례로 채워요. ${e(s.layoutName)}의 자리와 순서대로 해석합니다.</p></div>`; }
function renderReveal() { const s=spread();return `<div class="shell page">${steps(3)}${questionStrip()}<div class="stage-heading"><h2>배치 속에서 카드를 만나보세요.</h2><p>${e(s.layoutName)} · ${e(s.layoutDescription)}</p></div><div class="reveal-grid has-layout" style="${layoutStyle(s)}" data-layout="${s.layout}" data-count="${s.count}">${state.selected.map((picked,i)=>{const card=CARD_MAP.get(picked.id);return `<div class="reveal-item" style="${cellStyle(s,i)}"><div class="slot-label"><b>${i+1}번째 카드</b>${e(s.positions[i].name)}</div><button class="reveal-card ${i<state.revealed?'revealed':''}" data-reveal-index="${i}" aria-label="${i<state.revealed?`${e(card.name)}, ${picked.reversed?'역방향':'정방향'}`:`${i+1}번째 카드 공개`}" ${i!==state.revealed?'disabled':''}><div class="flip-inner"><div class="flip-back card-back">${backMark}</div><div class="flip-front" aria-hidden="true"><img src="${image(card.id)}" alt="" width="500" height="870" class="${picked.reversed?'reversed':''}"></div></div></button><div class="reveal-title" id="reveal-title-${i}">${i<state.revealed?`${e(card.name)}<span>${picked.reversed?'역방향':'정방향'}</span>`:'<span class="card-hidden-name">✧</span>'}</div></div>`;}).join('')}</div><div class="stage-actions"><button class="btn ${state.revealed<s.count?'primary':'ghost'}" data-action="reveal-next" ${state.revealed===s.count?'disabled':''}>다음 카드 공개 ${arrow}</button><button class="btn ghost" data-action="reveal-all" ${state.revealed===s.count?'disabled':''}>차례로 모두 공개</button><button class="btn ${state.revealed===s.count?'primary':''}" data-action="show-result" ${state.revealed===s.count?'':'disabled'}>나의 리딩 읽기 ${arrow}</button></div><p class="stage-hint" id="reveal-hint">${state.revealed===s.count?'모든 카드가 공개됐어요. 이제 자리별 이야기를 읽어보세요.':`${state.revealed} / ${s.count}장 공개`}</p></div>`; }
function readingBody(r) {
  const rs = SPREADS.find(s => s.id === r.spreadId);
  return `<p class="result-meta">${e(dateText(r.date,true))} &nbsp; / &nbsp; ${e(r.spreadName)} &nbsp; / &nbsp; ${e(r.topicName)}</p><p class="result-question">“${e(r.question)}”</p><div class="result-card-strip has-layout" data-layout="${rs.layout}" style="${layoutStyle(rs)}">${r.entries.map((c,i)=>`<figure style="${cellStyle(rs,i)}"><button data-card="${e(c.id)}" aria-label="${e(c.name)} 카드 자세히 보기"><img src="${image(c.id)}" width="500" height="870" loading="lazy" alt="${e(c.name)} ${c.reversed?'역방향':'정방향'}" class="${c.reversed?'reversed':''}"></button><figcaption><span>${e(c.positionName)}</span>${e(c.name)}</figcaption></figure>`).join('')}</div><section class="reading-overview" aria-label="리딩 요약"><div><h2>카드가 건네는 이야기</h2><p>${e(r.summary)}</p></div><div><h2>지금 마음에 남겨둘 것</h2><p>${e(r.focus)}</p></div></section><section aria-label="자리별 카드 해설">${r.entries.map((c,i)=>`<article class="reading-entry"><button data-card="${e(c.id)}" aria-label="${e(c.name)} 카드 자세히 보기"><img src="${image(c.id)}" width="500" height="870" loading="lazy" alt="${e(c.name)}" class="${c.reversed?'reversed':''}"></button><div><p class="entry-position">${String(i+1).padStart(2,'0')} &nbsp; ${e(c.positionName)} — ${e(c.positionMeaning)}</p><div class="entry-title"><h3>${e(c.name)}</h3><span class="orientation">${c.reversed?'역방향':'정방향'}</span></div><p class="entry-keywords">${c.keywords.map(e).join(' · ')}</p><p class="entry-meaning">${e(c.cardMeaning)}</p><p class="entry-reading">${e(c.interpretation)}</p><p class="entry-advice">작은 실천 &nbsp; ${e(c.advice)}</p></div></article>`).join('')}</section><div class="reflection-box"><span>나에게 건네는 질문</span><p>${e(r.reflection)}</p></div>`;
}

function renderResult() {
  const r = state.reading;
  if(!r) return renderHome();
  const rounds = [r, ...r.followups];
  return `<div class="shell page result-page">
    <div class="result-head"><h1>나의 타로 리딩</h1><span class="saved-indicator">${state.saved ? '<b>✓</b> 이 기기에 저장됨' : '기록 저장을 확인해 주세요'}</span></div>
    <div class="reading-thread">${rounds.map((round, index) => {
      const latest = index === rounds.length - 1;
      return `<details class="reading-round" ${latest ? 'open' : ''}>
        <summary><span>질문 ${index+1}</span><strong>${e(round.question)}</strong></summary>
        <div class="reading-round-body">${readingBody(round)}</div>
      </details>`;
    }).join('')}</div>
    <div class="result-actions">
      <div class="action-buttons">
        <button class="btn" data-action="copy-reading">${copyIcon} 이번 풀이 복사</button>
        ${rounds.length > 1 ? `<button class="btn" data-action="copy-thread">${copyIcon} 전체 흐름 복사</button>` : ''}
        <button class="btn ghost" data-action="share-reading">${shareIcon} ${rounds.length > 1 ? '전체 흐름 공유' : '공유하기'}</button>
      </div>
      <label class="share-options"><input type="checkbox" id="hide-question" ${state.hideQuestion ? 'checked' : ''}>복사·공유할 때 내 질문 숨기기</label>
      <p class="discreet">각 질문의 풀이는 뽑은 카드와 자리, 선택한 주제로 구성돼요.</p>
    </div>
    <section class="followup-panel" aria-label="추가 질문">
      ${state.followupOpen ? followupForm(rounds.length+1) : `<div class="action-buttons">
        <button class="btn primary" data-action="open-followup">+ 추가 질문하기</button>
        <button class="btn ghost" data-action="new-reading">새 리딩 시작 ${arrow}</button>
      </div>`}
    </section>
  </div>`;
}

function followupForm(number) {
  return `<form id="followup-form" novalidate>
    <h2>질문 ${number} 이어가기</h2>
    <label class="question-label" for="followup-question">어떤 점이 더 궁금한가요?</label>
    <textarea id="followup-question" maxlength="240" aria-describedby="followup-error">${e(state.followupQuestion)}</textarea>
    <p id="followup-error" class="field-error" role="alert"></p>
    <label class="followup-select">카드 배열 <select id="followup-spread" class="setting-select">${SPREADS.map(s =>
      `<option value="${s.id}" ${s.id === (state.followupSpread || 'single') ? 'selected' : ''}>${e(s.name)} · ${s.count}장</option>`).join('')}</select></label>
    <p class="discreet">카드를 새로 섞어요. 앞서 나온 카드가 다시 나올 수 있어요.</p>
    ${readingSettings(SPREADS.find(s=>s.id===(state.followupSpread || 'single')))}
    <div class="action-buttons">
      <button type="submit" class="btn primary">추가 질문 카드 섞기 ${arrow}</button>
      <button type="button" class="btn ghost" data-action="cancel-followup">취소</button>
    </div>
  </form>`;
}
function renderLibrary() { return `<div class="shell page"><div class="page-head"><div><p class="eyebrow">THE LANGUAGE OF SYMBOLS</p><h1>카드의 언어</h1><p>78장의 그림 속에서 나에게 닿는 상징을 찾아보세요.</p></div><button class="btn ghost small" data-action="guide">처음 읽는 타로 ${arrow}</button></div><div class="toolbar"><div class="filter-chips" aria-label="카드 종류 필터">${[['all','전체'],['major','메이저'],['wands','완드'],['cups','컵'],['swords','소드'],['pentacles','펜타클']].map(([id,name])=>`<button class="chip ${state.libraryFilter===id?'active':''}" data-filter="${id}" aria-pressed="${state.libraryFilter===id}">${name}</button>`).join('')}</div><label class="search-field"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="library-search" type="search" placeholder="카드 이름이나 키워드 찾기" value="${e(state.librarySearch)}" aria-label="카드 검색"></label></div><p class="library-count" id="library-count"></p><div class="library-grid" id="library-grid"></div></div>`; }
function updateLibrary() { if(!$('#library-grid'))return; const q=state.librarySearch.trim().toLocaleLowerCase(); const cards=CARDS.filter(c=>(state.libraryFilter==='all'||c.arcana===state.libraryFilter||c.suit===state.libraryFilter)&&(!q||`${c.name} ${c.english} ${c.keywords.join(' ')}`.toLocaleLowerCase().includes(q))); $('#library-count').textContent=`${cards.length}장의 카드`; $('#library-grid').innerHTML=cards.length?cards.map(c=>`<button class="library-card" data-card="${c.id}" aria-label="${e(c.name)} 카드 해설 보기"><div class="library-image"><img src="${image(c.id)}" width="500" height="870" alt="${e(c.name)}" loading="lazy" decoding="async"></div><h3>${e(c.name)}</h3><p>${c.keywords.map(e).join(' · ')}</p></button>`).join(''):'<div class="empty-state" style="grid-column:1/-1"><p>일치하는 카드가 없어요. 다른 이름이나 키워드로 찾아보세요.</p></div>'; }
function renderHistory() { return `<div class="shell page page-narrow"><div class="page-head"><div><p class="eyebrow">LITTLE NOTES TO MYSELF</p><h1>나의 기록<span class="count-badge">${readings.length}</span></h1><p>그날의 질문과, 그날의 나를 다시 만나보세요.</p></div>${readings.length?'<button class="btn ghost small" data-action="export-history">기록 내보내기 ↗</button>':''}</div><p class="save-notice">이 브라우저에 최근 40개의 리딩을 보관해요. 브라우저 데이터를 지우거나 다른 기기로 바꾸면 기록이 이어지지 않습니다.</p>${readings.length?`<div class="history-list">${readings.map(r=>`<article class="history-item"><button class="history-open" data-open-reading="${e(r.id)}"><div class="history-thumbs" aria-hidden="true">${r.entries.slice(0,3).map(c=>`<img src="${image(c.id)}" width="500" height="870" alt="" loading="lazy">`).join('')}</div><div class="history-text"><p>${e(r.question)}</p><span>${e(dateText(r.date,true))} &nbsp; · &nbsp; ${e(r.spreadName)}${r.followups.length ? ` · 질문 ${r.followups.length+1}개` : ''}</span></div></button><button class="icon-button" data-delete-reading="${e(r.id)}" aria-label="${e(r.question)} 기록 삭제">${closeIcon}</button></article>`).join('')}</div><div style="margin-top:20px;text-align:right"><button class="text-button" data-action="clear-history">모든 기록 지우기</button></div>`:`<div class="empty-state"><div class="empty-symbol" aria-hidden="true">✧</div><h2>아직 펼쳐지지 않은 이야기</h2><p>첫 리딩을 마치면 이곳에 조용히 쌓아둘게요.</p><button class="btn primary" data-action="new-reading">나의 첫 카드 뽑기 ${arrow}</button></div>`}</div>`; }
function birthResultHtml() { const r=state.birthResult;if(!r)return ''; return `<section class="birth-result" id="birth-result" aria-labelledby="birth-result-title"><p class="eyebrow">YOUR BIRTH CARDS</p><h2 id="birth-result-title">생일이 건네는 ${r.cards.length===3?'세':'두'} 장의 이야기</h2><p class="discreet">${e(r.date)} · ${e(r.method)} · 계산을 통한 상징적 자기 탐색</p><div class="birth-math">${r.steps.map(s=>e(s)).join('<br>')}</div><div class="birth-cards" style="--count:${r.cards.length}" data-count="${r.cards.length}">${r.cards.map(c=>`<article class="birth-card"><img src="${image(c.id)}" alt="${e(c.name)}" width="500" height="870"><h3>${c.number}. ${e(c.name)}</h3><p class="birth-subtitle">${e(c.english)} · ${c.keywords.map(e).join(' · ')}</p><p>${e(c.birth)}</p><p class="birth-advice">살펴볼 습관 &nbsp; ${e(c.advice)}</p></article>`).join('')}</div><div class="stage-actions" style="margin-top:25px"><button class="btn" data-action="copy-birth">${copyIcon} 탄생 카드 복사하기</button></div><p class="discreet">태어난 날짜로 성격이 결정되지는 않아요. 카드에서 공감되는 부분을 찾아 자신을 돌아보는 데 활용해 보세요.</p></section>`; }
function renderBirth() { return `<div class="shell page page-narrow"><section class="birth-intro"><div class="birth-copy"><p class="eyebrow">WRITTEN IN YOUR NUMBERS</p><h1>내 생일에 담긴,<br><span style="color:var(--gold)">또 다른 나의 모습.</span></h1><p>생년월일의 숫자를 메이저 아르카나와 연결해 보세요.<br>카드의 상징으로 나의 성향과 강점을 돌아보는 시간입니다.</p><form class="birth-form" id="birth-form" novalidate><label for="birth-date">양력 생년월일</label><div class="birth-input-row"><input id="birth-date" class="date-input" type="date" min="1900-01-01" max="${todayString()}" value="${e(state.birthInput)}" required aria-describedby="birth-error birth-privacy"><button class="btn primary" type="submit">나의 카드 찾기 ${arrow}</button></div><p id="birth-error" class="field-error" role="alert"></p><p id="birth-privacy" class="discreet">생년월일은 브라우저 안에서만 계산하며, 기록에 저장하지 않아요.</p></form></div><div class="birth-art" aria-label="마법사와 운명의 수레바퀴 카드"><div class="orbit"></div>${artCard('m01','')}${artCard('m10','')}</div></section><div class="birth-explanation"><h2>탄생 카드는 어떻게 계산하나요?</h2><p>월솜은 Tarot School 방식을 사용합니다. 월·일·연도의 앞 두 자리와 뒤 두 자리를 더하고, 그 수를 줄여 메이저 카드의 번호와 연결합니다. 보통 두 장, 19가 나오면 세 장의 카드가 연결돼요. 계산법에 따라 결과가 달라질 수 있으며, 바보(0번)는 이 방식의 계산 대상에 포함하지 않습니다.</p><button class="text-button" data-action="birth-method" style="margin-top:10px">계산법과 예시 자세히 보기 ${arrow}</button></div><div id="birth-output">${birthResultHtml()}</div></div>`; }

function openModal(title, body) { $('#modal-content').innerHTML=`<div class="modal-header"><h2 id="modal-title">${e(title)}</h2><button class="icon-button" data-action="close-modal" aria-label="닫기">${closeIcon}</button></div><div class="modal-body">${body}</div>`; if(!dialog.open)dialog.showModal(); dialog.scrollTop=0; }
function showGuide() { openModal('처음 펼치는 타로',`<p>카드 한 장에는 기본 상징이 있고, 놓이는 자리에는 질문을 바라보는 역할이 있어요. 두 가지를 함께 읽으면 카드의 이야기가 더 분명해집니다.</p><ol><li><strong>질문을 적어요.</strong> “언제 반드시 성공할까?”보다 “이 일을 준비할 때 무엇을 살펴보면 좋을까?”처럼 내가 행동할 수 있는 질문이 어울려요.</li><li><strong>배열을 먼저 골라요.</strong> 한 장은 짧은 조언, 세 장은 흐름과 행동, 다섯 장은 복잡한 고민이나 선택을 살펴볼 때 사용해요.</li><li><strong>카드를 섞고 골라요.</strong> 뽑은 순서대로 1번 자리부터 채워집니다. 정해진 손이나 셔플 횟수는 필요하지 않아요.</li><li><strong>모두 고른 뒤 펼쳐요.</strong> 같은 카드도 과거 자리에서는 이전의 영향으로, 조언 자리에서는 지금 취할 태도로 읽습니다.</li></ol><h3>메이저와 마이너</h3><p>메이저 22장은 삶의 큰 주제와 태도를, 마이너 56장은 일상의 구체적인 장면을 상징합니다. 완드는 의욕과 시도, 컵은 감정과 관계, 소드는 생각과 판단, 펜타클은 생활과 자원을 돌아보는 실마리예요.</p><h3>역방향은 나쁜 카드인가요?</h3><p>거꾸로 놓인 카드는 지연, 지나침, 부족함 또는 안쪽으로 향하는 에너지처럼 다른 관점으로 읽습니다. 월솜은 처음에는 정방향만 사용하고, 설정에서 역방향을 켤 수 있어요.</p><h3>나에게 맞게 읽어보세요</h3><p>월솜의 풀이는 미리 작성한 해설을 카드·자리·주제에 맞춰 조합합니다. 내 경험에 맞는 부분과 맞지 않는 부분을 살피고, 오늘 가능한 작은 행동을 찾아보세요.</p>`); }
function showSpreadInfo() { const s=spread(); openModal(s.name,`<div class="modal-layout">${layoutDiagram(s,{large:true})}</div><p class="spread-layout-name">${e(s.layoutName)}</p><p>${e(s.layoutDescription)}</p><p>${e(s.description)}</p><h3>이런 질문에 어울려요</h3><p>“${e(s.question)}”</p><h3>카드는 이 순서로 놓여요</h3><ol>${s.positions.map(p=>`<li><strong>${e(p.name)}</strong><br>${e(p.meaning)}</li>`).join('')}</ol><button class="btn primary full" data-action="close-modal">이 배열로 살펴보기</button>`); }
function showCard(id) { const c=CARD_MAP.get(id);if(!c)return; const source=globalThis.ASSET_SOURCES?.cards?.find(s=>s.id===c.id)?.sourcePage; const sourceLink=source||`https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)`; openModal(c.name,`<div class="card-detail"><img src="${image(c.id)}" alt="${e(c.name)}" width="500" height="870"><div><p class="detail-en">${e(c.english)}</p><p class="detail-keywords">${c.keywords.map(e).join(' · ')}</p><p>${c.arcana==='major'?`메이저 아르카나 · ${c.number}번`:`마이너 아르카나 · ${e({wands:'완드',cups:'컵',swords:'소드',pentacles:'펜타클'}[c.suit])}`}</p></div><div class="detail-copy"><h3>정방향</h3><p>${e(c.upright)}</p><h3>역방향</h3><p>${e(c.reversed)}</p><h3>작은 실천</h3><p>${e(c.advice)}</p><p class="discreet">그림: Pamela Colman Smith, 1909 원본 스캔<br><a href="${e(sourceLink)}" target="_blank" rel="noopener noreferrer">이미지 출처 확인 ↗</a></p></div></div>`); }
function showCredits() { openModal('자료와 이미지 출처',`<h3>카드 그림</h3><p>Rider–Waite–Smith, 1909 Roses &amp; Lilies 에디션. 그림 Pamela Colman Smith, 구성 Arthur Edward Waite. 스캔 Saskia Jansen.</p><p>Wikimedia Commons에서 파일별 퍼블릭 도메인과 PD-old-70-expired 표시를 확인한 78장입니다. 원본의 색감과 테두리를 보존하며 웹용 WebP로 최적화했습니다.</p><p><a href="https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)" target="_blank" rel="noopener noreferrer">1909 원본 이미지 모음 ↗</a><br><a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener noreferrer">Public Domain Mark 안내 ↗</a><br><button class="text-button" data-action="download-sources">78장 개별 출처 목록 내려받기 ↓</button></p><h3>카드 해설과 배열</h3><p>카드 해설은 일반적인 RWS 상징을 바탕으로 월솜을 위해 새로 작성했습니다. 참고로 제공된 책의 문장, 한국식 재해석, 이미지와 고유 배열은 사용하지 않았습니다. 다섯 장 배열은 월솜에서 초보자를 위해 구성한 안내용 배열입니다.</p><p><a href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_2" target="_blank" rel="noopener noreferrer">상징 체계 참고: Waite의 공개 원전 ↗</a></p><h3>탄생 카드</h3><p>Tarot School의 숫자 계산 방식을 사용하며 성향과 조언 문장은 새로 작성했습니다. 해당 사이트의 카드 그림이나 성향 설명은 가져오지 않았습니다.</p><p><a href="https://www.thetarotschool.com/BirthCards2.html" target="_blank" rel="noopener noreferrer">계산 방식 원출처 ↗</a></p><h3>나의 데이터</h3><p>질문과 결과는 현재 브라우저의 저장공간에만 보관합니다. 계정, 광고, 방문 추적 도구는 사용하지 않습니다. 생년월일은 계산에만 쓰고 기록에 저장하지 않습니다.</p>`); }
function showBirthMethod() { openModal('탄생 카드 계산법',`<p>여러 탄생 카드 계산법 중 Tarot School 방식을 사용합니다. 양력 생년월일로 계산하며, 결과에 계산 과정을 함께 표시합니다.</p><ol><li>월 + 일 + 연도의 앞 두 자리 + 뒤 두 자리를 더합니다.</li><li>세 자리 합이면 앞의 두 자리를 하나의 수로 보고 끝자리와 더합니다. 예: 116 → 11 + 6 = 17.</li><li>두 자리 합은 필요할 때 자릿수를 더해 21 이하로 줄입니다. 카드 번호를 다시 줄여 연결되는 카드를 찾습니다.</li><li>한 자리 수만 나오면 연결된 두 자리 카드를 함께 봅니다. 19는 19·10·1 세 장, 20은 20·2, 21은 21·3으로 읽습니다.</li></ol><p>예: 1950년 2월 21일 → 2 + 21 + 19 + 50 = 92 → 9 + 2 = 11 → 1 + 1 = 2. 정의(11)와 여사제(2)가 연결됩니다.</p><p>0은 양수의 합으로 나오지 않으므로 바보(0번)는 이 방식의 계산에 포함하지 않아요.</p><p><a href="https://www.thetarotschool.com/BirthCards2.html" target="_blank" rel="noopener noreferrer">원출처에서 계산 방식 확인 ↗</a></p>`); }
function download(filename, content, type='application/json') { const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
async function copyText(text) { try { if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);toast('내용을 깔끔하게 복사했어요.');return true;} } catch {} const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch{}area.remove();if(ok){toast('내용을 깔끔하게 복사했어요.');return true;}openModal('내용 직접 복사하기','<p>이 브라우저에서는 자동 복사를 사용할 수 없어요. 아래 내용을 선택해 복사해 주세요.</p><textarea class="manual-copy" id="manual-copy" readonly aria-label="공유할 결과 내용"></textarea><button class="btn full" data-action="select-copy" style="margin-top:12px">전체 선택</button>');$('#manual-copy').value=text;$('#manual-copy').select();return false; }
function currentText({all=false}={}) {
  const rounds = [state.reading, ...state.reading.followups];
  const format = reading => formatReading(reading,{hideQuestion:state.hideQuestion});
  if(!all || rounds.length===1) return format(rounds.at(-1));
  return rounds.map((round, index) => `질문 ${index+1}
${format(round)}`).join('\n\n──────────\n\n');
}
async function shareReading() { const text=currentText({all:true});if(navigator.share){try{await navigator.share({title:'월솜 타로 · 나의 리딩',text});return;}catch(error){if(error.name==='AbortError')return;}}await copyText(text); }
function clearFollowup() {
  state.followup=false;
  state.followupOpen=false;
  state.followupQuestion='';
  state.followupSpread='single';
}

function newReading() { clearFollowup();state.spreadId=null;state.question='';state.deck=[];state.selected=[];state.reading=null;state.shuffled=false;state.shuffleCount=0;state.revealed=0;setView('home');$('#question')?.focus({preventScroll:true}); }
function startReading() { clearFollowup();try { if(!state.spreadId)throw new Error('위에서 배열을 먼저 골라주세요.');state.question=validateQuestion($('#question')?.value??state.question);state.selected=[];state.revealed=0;state.shuffled=false;state.shuffleCount=0;state.deck=[];setView('shuffle'); }catch(error){$('#question-error').textContent=error.message;$('#question').setAttribute('aria-invalid','true');$('#question').focus();} }
async function runShuffle(cut=false) { if(state.busy||state.view!=='shuffle')return;state.busy=true;const stage=$('.shuffle-stage');const mode=state.shuffleMode;$$('.shuffle-options button,.stage-actions button',main).forEach(b=>b.disabled=true);try{if(cut){if(!state.deck.length)return;const b=new Uint32Array(1);crypto.getRandomValues(b);const split=1+(b[0]%(state.deck.length-1));state.deck=state.deck.slice(split).concat(state.deck.slice(0,split));stage.classList.add('cutting');$('#shuffle-hint').textContent='카드 묶음을 나누어 순서를 바꾸고 있어요.';}else{state.sessionDeck=settings.deck;state.sessionReversed=settings.reversed;state.deck=shuffleDeck(settings.deck==='major'?CARDS.filter(c=>c.arcana==='major'):CARDS,settings.reversed);stage.dataset.mode=mode;stage.classList.add('shuffling');$('#shuffle-hint').textContent='질문을 떠올리며 잠깐 숨을 고르세요.';}await delay(duration(cut?1100:mode==='wash'?1800:mode==='riffle'?1600:1500));if(!cut){state.shuffled=true;state.shuffleCount++;}announce(cut?'카드를 나눴어요.':`${state.shuffleCount}번 섞었어요. 카드 고르기를 누르세요.`);}catch(error){toast(error.message);}finally{state.busy=false;if(state.view==='shuffle'){main.innerHTML=renderShuffle();renderNav();}} }
function armCard(index, button) {
  $('.wheel-hit[aria-pressed="true"]')?.setAttribute('aria-pressed','false');
  state.activeCard = index;
  button.setAttribute('aria-pressed','true');
  announce(`${index+1}번째 뒷면 카드가 나왔어요. 같은 카드를 다시 누르면 선택돼요.`);
}

async function pickCard(index, button, {keyboard=false}={}) {
  if(state.busy || state.view!=='pick' || state.activeCard!==index || button.disabled || state.selected.length>=spread().count) return;
  const picked = state.deck[index];
  const face = button.nextElementSibling;
  const target = $(`#slot-${state.selected.length}`);
  if(!picked || !face || !target) return;

  const start = $('.wheel-back', face).getBoundingClientRect();
  const end = target.getBoundingClientRect();
  state.busy = true;
  state.activeCard = null;
  state.selected.push({...picked,deckIndex:index});
  button.disabled = true;
  button.setAttribute('aria-pressed','false');
  face.hidden = true;
  try {
    if(duration(650) && button.animate && start.width && start.height){
      const ghost = document.createElement('div');
      ghost.className = 'card-back flying-card';
      ghost.innerHTML = backMark;
      ghost.style.cssText = `left:${start.left}px;top:${start.top}px;width:${start.width}px;height:${start.height}px`;
      document.body.append(ghost);
      try {
        await ghost.animate([
          {transform:'translate(0,0)'},
          {transform:`translate(${end.left-start.left}px,${end.top-start.top}px) scale(${end.width/start.width},${end.height/start.height})`}
        ],{duration:duration(650),easing:'cubic-bezier(.22,1,.36,1)'}).finished;
      } finally {
        ghost.remove();
      }
    }
  } catch {
    // The choice is committed even when the animation is interrupted.
  } finally {
    target.innerHTML = backCard();
    target.classList.add('filled');
    const done = state.selected.length===spread().count;
    const nextPosition = spread().positions[state.selected.length];
    $('#wheel-next').textContent = nextCardText();
    $('#draw-count').textContent = `${state.selected.length} / ${spread().count}장 선택`;
    $('#next-position').innerHTML = nextPosition
      ? `다음은 ${state.selected.length+1}번 · ${e(nextPosition.name)}<span>${e(nextPosition.meaning)}</span>`
      : '모든 자리를 채웠어요. 이제 카드를 펼쳐보세요.';
    const revealButton = $('[data-action="start-reveal"]');
    revealButton.disabled = !done;
    if(done){
      $$('.wheel-hit').forEach(card => card.disabled = true);
      $('#pick-instruction').textContent = '모든 카드를 골랐어요. 이제 한 장씩 공개해 볼까요?';
      announce('모든 카드를 골랐어요. 선택한 카드 펼치기를 누르세요.');
      if(keyboard) revealButton.focus({preventScroll:true});
    } else {
      announce(`${state.selected.length}번째 카드를 골랐어요. 다음은 ${nextPosition.name} 자리예요.`);
      if(keyboard){
        const available = $$('.wheel-hit:not(:disabled)');
        (available.find(card => Number(card.dataset.deckIndex)>index) || available[0])?.focus({preventScroll:true});
      }
    }
    state.busy = false;
  }
}
async function revealOne({inSequence=false}={}) { if((state.busy&&!inSequence)||state.view!=='reveal'||state.revealed>=state.selected.length)return;const ownsBusy=!inSequence;if(ownsBusy)state.busy=true;const i=state.revealed;const picked=state.selected[i];const card=CARD_MAP.get(picked.id);const btn=$(`[data-reveal-index="${i}"]`);$$('.stage-actions button',main).forEach(b=>b.disabled=true);btn?.classList.add('revealed');btn?.setAttribute('aria-label',`${card.name}, ${picked.reversed?'역방향':'정방향'}`);if(btn)btn.disabled=true;state.revealed++;await delay(duration(850));if(state.view==='reveal'){$(`#reveal-title-${i}`).innerHTML=`${e(card.name)}<span>${picked.reversed?'역방향':'정방향'}</span>`;$('#reveal-hint').textContent=state.revealed===state.selected.length?'모든 카드가 공개됐어요. 이제 자리별 이야기를 읽어보세요.':`${state.revealed} / ${state.selected.length}장 공개`;announce(`${spread().positions[i].name}, ${card.name}, ${picked.reversed?'역방향':'정방향'}`);if(ownsBusy)updateRevealButtons();}if(ownsBusy)state.busy=false; }
function updateRevealButtons() { const done=state.revealed>=state.selected.length;$('[data-action="reveal-next"]').disabled=done;$('[data-action="reveal-all"]').disabled=done;$('[data-action="show-result"]').disabled=!done;$('[data-action="show-result"]').classList.toggle('primary',done);$('[data-action="reveal-next"]').classList.toggle('primary',!done);const next=$(`[data-reveal-index="${state.revealed}"]`);if(next)next.disabled=false; }
async function revealAll() { if(state.busy||state.view!=='reveal')return;state.busy=true;try{while(state.revealed<state.selected.length&&state.view==='reveal'){await revealOne({inSequence:true});if(state.revealed<state.selected.length)await delay(duration(280));}if(state.view==='reveal')updateRevealButtons();}finally{state.busy=false;} }
function startFollowup() {
  if(state.view!=='result' || !state.reading || !state.followupOpen) return;
  const input = $('#followup-question');
  try {
    state.question=validateQuestion(input.value);
  } catch(error) {
    $('#followup-error').textContent=error.message;
    input.setAttribute('aria-invalid','true');
    input.focus();
    return;
  }
  state.followup=true;
  state.followupQuestion=input.value;
  state.spreadId=$('#followup-spread').value;
  state.topic=state.reading.followups.at(-1)?.topic || state.reading.topic || 'general';
  state.deck=[];state.selected=[];state.revealed=0;state.shuffled=false;state.shuffleCount=0;
  setView('shuffle');
}

async function showResult() {
  if(state.busy || state.view!=='reveal' || state.revealed!==spread().count) return;
  state.busy = true;
  try {
    const round = makeReading({question:state.question,topic:state.topic,spreadId:state.spreadId,selected:state.selected.map(({id,reversed})=>({id,reversed}))});
    round.deckMode = state.sessionDeck || settings.deck;
    round.allowReversed = state.sessionReversed ?? settings.reversed;
    const parent = state.followup ? state.reading : null;
    const parentWasSaved = parent && state.saved;
    let result = parent ? {...parent, followups:[...parent.followups,round]} : {...round,followups:[]};
    try {
      state.saved = await changeReadings(latest => {
        const existing = parent && latest.find(r=>r.id===parent.id);
        if(existing) result = {...existing, followups:[...existing.followups,round]};
        else if(parentWasSaved) throw new Error('다른 탭에서 이 기록이 사라졌어요. 이번 풀이를 복사해 보관할 수 있어요.');
        return [result,...latest.filter(r=>r.id!==result.id)];
      });
      if(!state.saved) toast('기록을 저장하지 못했어요. 내용을 복사해 보관해 주세요.');
    } catch(error) {
      state.saved = false;
      toast(error.message);
    }
    state.reading = result;
    clearFollowup();
    setView('result',{scroll:!parent});
    if(parent){
      const latest = $('.reading-round:last-child summary');
      latest?.focus({preventScroll:true});
      latest?.scrollIntoView({block:'start',behavior:'instant'});
    }
  } catch(error) {
    toast(error.message);
  } finally {
    state.busy = false;
  }
}
function confirmReset() { openModal('다시 섞을까요?',`<p>지금 고른 카드를 내려놓고 같은 질문으로 다시 섞습니다.</p><div class="stage-actions"><button class="btn ghost" data-action="close-modal">계속 고르기</button><button class="btn primary" data-action="confirm-repick">다시 섞기</button></div>`); }
function confirmLeave(view) { openModal('지금 리딩을 나갈까요?',`<p>진행 중인 카드 선택은 저장되지 않습니다. 완성한 결과는 나의 기록에 남아요.</p><div class="stage-actions"><button class="btn ghost" data-action="close-modal">계속하기</button><button class="btn primary" data-leave-to="${e(view)}">이동하기</button></div>`); }

function deleteReadings(button,change,message) {
  button.disabled = true;
  return changeReadings(change).then(saved => {
    if(!saved) throw new Error();
    dialog.close();
    render();
    toast(message);
  }).catch(() => {
    button.disabled = false;
    toast('기록을 삭제하지 못했어요. 브라우저 저장 설정을 확인해 주세요.');
  });
}

function clearBirthResult(input) {
  state.birthInput = input.value;
  state.birthResult = null;
  $('#birth-output').replaceChildren();
  $('#birth-error').textContent = '';
  input.removeAttribute('aria-invalid');
}

document.addEventListener('submit',event => {
  if(event.target.id==='question-form'){event.preventDefault();startReading();}
  if(event.target.id==='followup-form'){event.preventDefault();startFollowup();}
  if(event.target.id!=='birth-form') return;
  event.preventDefault();
  const input = $('#birth-date');
  clearBirthResult(input);
  try {
    state.birthResult = birthCards(input.value);
    $('#birth-output').innerHTML = birthResultHtml();
    $('#birth-result').scrollIntoView({behavior:duration(1)?'smooth':'instant',block:'start'});
    announce('탄생 카드 계산을 마쳤어요.');
  } catch(error) {
    $('#birth-error').textContent = error.message;
    input.setAttribute('aria-invalid','true');
    input.focus();
  }
});

document.addEventListener('input',event=>{if(event.target.id==='birth-date')clearBirthResult(event.target);if(event.target.id==='question'){state.question=event.target.value;$('#question-counter').textContent=`${[...state.question].length} / 240`;$('#question-error').textContent='';event.target.removeAttribute('aria-invalid');}if(event.target.id==='followup-question'){
  state.followupQuestion=event.target.value;
  $('#followup-error').textContent='';
  event.target.removeAttribute('aria-invalid');
}if(event.target.id==='library-search'){state.librarySearch=event.target.value;updateLibrary();}});
document.addEventListener('change',event=>{if(event.target.id==='hide-question')state.hideQuestion=event.target.checked;
const {readingSetting}=event.target.dataset;
if(readingSetting){
  if(readingSetting==='direction') settings.reversed=event.target.value==='reversed';
  else settings[readingSetting]=event.target.value;
  applySettings();
  if(!writeStorage(KEYS.settings,settings))toast('이번 방문에 설정을 적용했어요.');
}
if(event.target.id==='followup-spread')state.followupSpread=event.target.value;
const summary=$('#deck-summary');
if(summary && (readingSetting || event.target.id==='followup-spread')){
  const id=state.view==='result' ? state.followupSpread || 'single' : state.spreadId;
  summary.textContent=deckSummary(SPREADS.find(s=>s.id===id));
}});
document.addEventListener('click',async event=>{const nav=event.target.closest('[data-nav]');if(nav){event.preventDefault();if(state.busy){toast('카드가 움직이는 중이에요. 잠시만 기다려 주세요.');return;}const view=nav.dataset.nav;if(['shuffle','pick','reveal'].includes(state.view)){confirmLeave(view);return;}clearFollowup();setView(view);return;}const b=event.target.closest('button,[data-leave-to]');if(!b||b.disabled)return;
  if(b.dataset.leaveTo){dialog.close();clearFollowup();state.deck=[];state.selected=[];state.shuffled=false;setView(b.dataset.leaveTo);return;}
if(b.dataset.spread){updateSpreadChoice(b.dataset.spread);return;}
  if(b.dataset.topic){state.topic=b.dataset.topic;$$('[data-topic]').forEach(el=>{const on=el.dataset.topic===state.topic;el.classList.toggle('active',on);el.setAttribute('aria-pressed',on);});return;}
  if(b.dataset.shuffleMode){if(state.busy)return;state.shuffleMode=b.dataset.shuffleMode;$$('[data-shuffle-mode]').forEach(el=>{const on=el.dataset.shuffleMode===state.shuffleMode;el.classList.toggle('active',on);el.setAttribute('aria-pressed',on);});$('.shuffle-stage').dataset.mode=state.shuffleMode;return;}
  if(b.hasAttribute('data-confirm-card')){
    const index = Number(b.dataset.confirmCard);
    const hit = $(`[data-deck-index="${index}"]`);
    if(hit) await pickCard(index,hit);
    return;
  }
  if(b.hasAttribute('data-deck-index')){
    if(state.busy || state.view!=='pick') return;
    const index = Number(b.dataset.deckIndex);
    if(state.activeCard!==index) armCard(index,b);
    else await pickCard(index,b,{keyboard:event.detail===0});
    return;
  }
  if(b.hasAttribute('data-reveal-index')){if(Number(b.dataset.revealIndex)===state.revealed)await revealOne();return;}
  if(b.dataset.card){showCard(b.dataset.card);return;}
  if(b.dataset.filter){state.libraryFilter=b.dataset.filter;$$('[data-filter]').forEach(el=>{const on=el.dataset.filter===state.libraryFilter;el.classList.toggle('active',on);el.setAttribute('aria-pressed',on);});updateLibrary();return;}
  if(b.dataset.openReading){const r=readings.find(r=>r.id===b.dataset.openReading);if(r){clearFollowup();state.reading=r;state.saved=persistedIds.has(r.id);setView('result');}return;}
  if(b.dataset.deleteReading){openModal('이 기록을 지울까요?',`<p>이 기기에 저장된 해당 리딩을 삭제합니다.</p><div class="stage-actions"><button class="btn ghost" data-action="close-modal">남겨두기</button><button class="btn primary" data-confirm-delete="${e(b.dataset.deleteReading)}">기록 삭제</button></div>`);return;}
  if(b.dataset.confirmDelete){
    await deleteReadings(b,latest=>latest.filter(r=>r.id!==b.dataset.confirmDelete),'기록을 지웠어요.');
    return;
  }
  const action=b.dataset.action;if(!action)return;
  try{switch(action){
    case 'close-modal':dialog.close();break;
    case 'go-question':$('#question-form').scrollIntoView({behavior:duration(1)?'smooth':'instant',block:'center'});$('#question').focus({preventScroll:true});break;
    case 'guide':showGuide();break;
    case 'credits':showCredits();break;
    case 'birth-method':showBirthMethod();break;
    case 'spread-info':showSpreadInfo();break;
    case 'example':state.question=spread().question;$('#question').value=state.question;$('#question-counter').textContent=`${[...state.question].length} / 240`;$('#question-error').textContent='';$('#question').removeAttribute('aria-invalid');$('#question').focus();break;
    case 'shuffle':await runShuffle();break;
    case 'cut':await runShuffle(true);break;
    case 'start-pick':if(state.shuffled&&!state.busy){state.selected=[];setView('pick');}break;
    case 'back-question':
      if(!state.busy){
        const followup=state.followup;
        state.followup=false;
        setView(followup?'result':'home');
        if(followup) $('#followup-question')?.focus();
      }
      break;
    case 'repick':if(!state.busy)confirmReset();break;
    case 'confirm-repick':dialog.close();state.selected=[];state.revealed=0;state.shuffled=false;state.shuffleCount=0;setView('shuffle');break;
    case 'start-reveal':if(!state.busy&&state.selected.length===spread().count){state.revealed=0;setView('reveal');}break;
    case 'reveal-next':await revealOne();break;
    case 'reveal-all':await revealAll();break;
    case 'show-result':await showResult();break;
    case 'open-followup':
      state.followupOpen=true;
      $('.followup-panel').innerHTML=followupForm(state.reading.followups.length+2);
      $('#followup-question').focus();
      break;
    case 'cancel-followup':
      clearFollowup();
      const panel=$('.followup-panel');
      panel.innerHTML='<div class="action-buttons"><button class="btn primary" data-action="open-followup">+ 추가 질문하기</button><button class="btn ghost" data-action="new-reading">새 리딩 시작</button></div>';
      $('[data-action="open-followup"]',panel).focus();
      break;
    case 'copy-thread':await copyText(currentText({all:true}));break;
    case 'copy-reading':await copyText(currentText());break;
    case 'share-reading':await shareReading();break;
    case 'new-reading':newReading();break;
    case 'clear-history':openModal('모든 기록을 지울까요?',`<p>이 브라우저에 보관한 ${readings.length}개의 리딩을 모두 삭제합니다. 보관할 내용이 있다면 먼저 기록을 내보내 주세요.</p><div class="stage-actions"><button class="btn ghost" data-action="close-modal">남겨두기</button><button class="btn primary" data-action="confirm-clear">모든 기록 삭제</button></div>`);break;
    case 'confirm-clear':await deleteReadings(b,()=>[],'모든 기록을 지웠어요.');break;
    case 'export-history':download(`월솜-타로-기록-${todayString()}.json`,JSON.stringify({app:'월솜 타로',version:1,exportedAt:new Date().toISOString(),readings},null,2));toast('기록 파일을 내려받았어요.');break;
    case 'select-copy':$('#manual-copy').focus();$('#manual-copy').select();break;
    case 'copy-birth':if(state.birthResult){const r=state.birthResult;await copyText(`월솜 타로 · 탄생 카드\n${r.date} · ${r.method}\n\n계산 과정\n${r.steps.join('\n')}\n\n${r.cards.map(c=>`${c.number}. ${c.name} (${c.english})\n${c.keywords.join(' · ')}\n${c.birth}\n살펴볼 습관: ${c.advice}`).join('\n\n')}\n\n성격을 결정하는 분석이 아닌 카드 상징을 통한 자기 탐색입니다.`);}break;
    case 'download-sources':if(globalThis.ASSET_SOURCES)download('월솜-타로-이미지-출처.json',JSON.stringify(globalThis.ASSET_SOURCES,null,2));else{const res=await fetch('assets/sources.json');if(!res.ok)throw new Error('출처 목록을 불러오지 못했어요.');download('월솜-타로-이미지-출처.json',await res.text());}break;
  }}catch(error){toast(error?.message||'잠시 후 다시 시도해 주세요.');}
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
window.addEventListener('storage',event => {
  if(event.storageArea!==localStorage || (event.key!==KEYS.history && event.key!==null)) return;
  syncReadings(loadReadings());
  if(state.view==='history') render();
});
window.addEventListener('hashchange',()=>{const view={reading:'home',birth:'birth',library:'library',history:'history'}[location.hash.slice(1)];if(view&&!state.busy){clearFollowup();setView(view);}});
window.addEventListener('beforeunload',event=>{if(['pick','reveal'].includes(state.view)&&state.selected.length){event.preventDefault();event.returnValue='';}});
applySettings();updateCount();const initialView={birth:'birth',library:'library',history:'history'}[location.hash.slice(1)]||'home';setView(initialView,{scroll:false});
if(!storageAvailable)setTimeout(()=>toast('이 브라우저에서는 기록 저장을 사용할 수 없어요. 결과를 복사해 보관해 주세요.'),700);
