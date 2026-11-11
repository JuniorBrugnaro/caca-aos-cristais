(function () {
  'use strict';

  const game = window.Cristais;
  const sound = window.CristaisSound;
  const byId = (id) => document.getElementById(id);
  const ui = Object.fromEntries([
    'home', 'play', 'grades', 'grade-notice', 'change-grade', 'playing-grade', 'home-button',
    'grade-dialog', 'grade-form', 'grade-dialog-title', 'grade-dialog-text', 'grade-pin',
    'grade-confirm-wrap', 'grade-confirm', 'grade-error', 'grade-submit', 'grade-cancel',
    'levels', 'level-title', 'health', 'stage', 'board', 'axis-x', 'axis-y', 'tiles',
    'actors', 'robot', 'objective', 'instruction', 'position', 'crystals', 'alert-row',
    'alert', 'bonus', 'bridge', 'feedback', 'restart', 'help', 'help-button', 'combat-help', 'result',
    'result-title', 'result-text', 'continue', 'replay',
  ].map((id) => [id, byId(id)]));
  const moveButtons = Array.from(document.querySelectorAll('[data-move]'));
  const soundButtons = Array.from(document.querySelectorAll('[data-sound-toggle]'));
  const storageKey = 'caca-aos-cristais-fases';
  const gradeKey = 'caca-aos-cristais-serie';
  const grades = [
    { number: 1, topic: 'Primeiros passos', description: 'Direções e contagem de casas' },
    { number: 2, topic: 'Cristais em ordem', description: 'Linhas, colunas e sequências' },
    { number: 3, topic: 'Espada de luz', description: 'Combate por turnos' },
    { number: 4, topic: 'Rotas surpresa', description: 'Armadilhas e novos caminhos' },
    { number: 5, topic: 'Travessia final', description: 'Estratégia e pontes temporárias' },
  ];
  let completed = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) completed = new Set(saved);
  } catch {
    // The game can also run when the browser does not allow local storage.
  }
  let assignment = null;
  try {
    const saved = JSON.parse(localStorage.getItem(gradeKey));
    if (saved && grades.some(({ number }) => number === saved.grade) &&
      /^[a-f0-9]{32}$/.test(saved.salt) && /^[a-f0-9]{64}$/.test(saved.digest)) {
      assignment = saved;
    }
  } catch {}
  let pendingGrade = null;
  let allowChange = false;
  let sessionOnly = false;
  let currentGrade = null;
  let currentLevels = [];
  let level;
  let state;
  let tiles = [];
  let labelsX = [];
  let labelsY = [];

  function element(tag, className, content) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (content !== undefined) item.textContent = content;
    return item;
  }

  function label(item, value) {
    if (item.textContent !== value) item.textContent = value;
  }

  const gradeName = (number) => number + 'º ano';
  const levelsFor = (grade) => game.levels.filter((entry) => entry.grade === grade);
  const completedIn = (grade) => levelsFor(grade).filter((entry) => completed.has(entry.id)).length;
  const hex = (bytes) => Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');

  function renderLevels() {
    ui.levels.replaceChildren(...currentLevels.map((entry, index) => {
      const button = element('button', 'level phase');
      const done = completed.has(entry.id);
      button.type = 'button';
      button.append(element('span', 'phase-number', 'Fase ' + (index + 1)));
      if (done) {
        const mark = element('span', 'phase-done', '✓');
        mark.setAttribute('aria-hidden', 'true');
        button.append(mark);
      }
      button.title = entry.title;
      if (entry === level) button.setAttribute('aria-current', 'step');
      button.setAttribute('aria-label', `Fase ${index + 1}: ${entry.title}${done ? ', concluída' : ''}`);
      button.addEventListener('click', () => {
        if (entry !== level) load(entry);
      });
      return button;
    }));
    label(ui['playing-grade'], `${gradeName(currentGrade)} · ${completedIn(currentGrade)} de ${currentLevels.length} fases concluídas`);
  }

  function renderHome() {
    ui.grades.replaceChildren(...grades.map(({ number, topic, description }) => {
      const locked = !!assignment && assignment.grade !== number && !allowChange;
      const selected = assignment?.grade === number && !allowChange;
      const card = element('button', 'grade-card');
      const total = levelsFor(number).length;
      card.type = 'button';
      card.disabled = locked;
      card.dataset.grade = number;
      if (selected) card.classList.add('assigned');
      card.append(element('span', 'grade-year', gradeName(number)),
        element('strong', 'grade-topic', topic), element('span', 'grade-description', description),
        element('span', 'grade-meta', locked ? 'Bloqueado' : selected ?
          `${completedIn(number)} de ${total} concluídas →` : `${total} fases →`));
      card.addEventListener('click', () => chooseGrade(number));
      return card;
    }));
    ui['change-grade'].hidden = !assignment;
    label(ui['change-grade'], allowChange ? 'Cancelar troca' : 'Trocar série');
    const notice = allowChange ? 'Professor, selecione a série para este navegador.' : assignment ?
      `${gradeName(assignment.grade)} liberado neste navegador.` : 'Selecione a série para preparar o jogo.';
    label(ui['grade-notice'], notice + (sessionOnly ? ' O navegador só manterá esta escolha durante a sessão.' : ''));
  }

  function showHome() {
    if (ui.result.open) ui.result.close();
    ui.play.hidden = true;
    ui.home.hidden = false;
    renderHome();
    ui.grades.querySelector('button:not(:disabled)')?.focus();
  }

  function saveAssignment(settings) {
    assignment = settings;
    try {
      localStorage.setItem(gradeKey, JSON.stringify(settings));
      sessionOnly = false;
    } catch {
      sessionOnly = true;
    }
  }

  function enterGrade(number) {
    if (assignment?.grade !== number) return;
    allowChange = false;
    currentGrade = number;
    currentLevels = levelsFor(number);
    ui.home.hidden = true;
    ui.play.hidden = false;
    if (level?.grade === number && state.status === 'playing') {
      renderLevels();
      render(true);
    } else {
      load(currentLevels.find((entry) => !completed.has(entry.id)) || currentLevels[0]);
    }
    ui.levels.querySelector('[aria-current="step"]')?.focus();
  }

  function chooseGrade(number) {
    sound.play('select');
    if (!assignment) {
      openGradeDialog(number);
      return;
    }
    if (allowChange) saveAssignment({ ...assignment, grade: number });
    enterGrade(number);
  }

  function openGradeDialog(number = null) {
    pendingGrade = number;
    const setting = number !== null;
    ui['grade-form'].reset();
    ui['grade-confirm-wrap'].hidden = !setting;
    ui['grade-confirm'].disabled = !setting;
    ui['grade-confirm'].required = setting;
    label(ui['grade-dialog-title'], setting ? `Preparar o ${gradeName(number)}` : 'Trocar série');
    label(ui['grade-dialog-text'], setting ?
      'Professor, crie um PIN de 4 a 8 dígitos para autorizar futuras trocas de série neste navegador.' :
      'Digite o PIN do professor para liberar a escolha de outra série.');
    label(ui['grade-submit'], setting ? 'Entrar no jogo' : 'Liberar escolha');
    label(ui['grade-error'], '');
    ui['grade-dialog'].showModal();
    ui['grade-pin'].focus();
  }

  async function pinDigest(pin, salt) {
    const bytes = new TextEncoder().encode(salt + ':' + pin);
    return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)));
  }

  async function submitGrade(event) {
    event.preventDefault();
    const submit = ui['grade-submit'];
    if (submit.disabled) return;
    const pin = ui['grade-pin'].value;
    const targetGrade = pendingGrade;
    if (targetGrade !== null && pin !== ui['grade-confirm'].value) {
      label(ui['grade-error'], 'Os dois PINs precisam ser iguais.');
      ui['grade-confirm'].focus();
      return;
    }
    submit.disabled = true;
    sound.prime();
    try {
      if (targetGrade !== null) {
        const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
        const digest = await pinDigest(pin, salt);
        if (!ui['grade-dialog'].open) return;
        saveAssignment({ grade: targetGrade, salt, digest });
        ui['grade-dialog'].close();
        enterGrade(targetGrade);
      } else {
        const digest = await pinDigest(pin, assignment.salt);
        if (!ui['grade-dialog'].open) return;
        if (digest !== assignment.digest) {
          label(ui['grade-error'], 'PIN incorreto. Confira e tente novamente.');
          ui['grade-pin'].select();
          return;
        }
        allowChange = true;
        ui['grade-dialog'].close();
        renderHome();
        ui.grades.querySelector('button')?.focus();
      }
    } catch {
      label(ui['grade-error'], 'Abra o arquivo local ou acesse o jogo por HTTPS para usar o PIN.');
    } finally {
      submit.disabled = false;
    }
  }

  function makeBoard() {
    ui.stage.style.setProperty('--cols', level.width);
    ui.stage.style.setProperty('--rows', level.height);
    labelsX = Array.from({ length: level.width }, (_, index) => element('span', '', index + 1));
    labelsY = Array.from({ length: level.height }, (_, index) => element('span', '', level.height - index));
    ui['axis-x'].replaceChildren(...labelsX);
    ui['axis-y'].replaceChildren(...labelsY);
    tiles = [];
    for (let y = level.height; y > 0; y -= 1) {
      for (let x = 1; x <= level.width; x += 1) {
        const tile = element('div', 'tile');
        tiles.push({ point: [x, y], tile });
      }
    }
    ui.tiles.replaceChildren(...tiles.map(({ tile }) => tile));
    label(ui['level-title'], level.title);
    ui.robot.classList.toggle('armed', !!level.sword);
    ui['combat-help'].hidden = !level.sword;
  }

  function piece(point, kind, part, detail) {
    const actor = element('div', 'piece ' + kind);
    actor.style.gridColumn = point[0];
    actor.style.gridRow = level.height - point[1] + 1;
    if (part) actor.append(element('span', part));
    if (detail) actor.append(detail);
    return actor;
  }

  function renderBoard(jump) {
    for (const { tile, point } of tiles) {
      let style = 'tile';
      if (game.contains(level.walls, point)) style += ' wall';
      else if (!state.energyOn && game.contains(level.breakable, point)) style += ' wall breakable';
      else if (game.contains(state.holes, point)) style += ' hole';
      else if (game.same(level.timedBridge, point)) style += state.bridge ? ' bridge' : ' bridge-closed';
      else if (game.contains(level.fragile, point)) style += ' fragile';
      else if (game.contains(level.spikes, point)) {
        style += ' spikes';
        if (game.spikeActive(level, point, state.turn + 1)) style += ' danger';
      } else if (!state.collected.length && game.contains(level.guide, point)) style += ' guide';
      if (tile.className !== style) tile.className = style;
    }

    const actors = [];
    level.crystals.forEach((point, index) => {
      if (state.collected.includes(game.key(point))) return;
      actors.push(piece(point, 'crystal', 'gem',
        level.ordered ? element('span', 'crystal-order', index + 1) : null));
    });
    state.loot.forEach((point) => actors.push(piece(point, 'bonus', 'gem')));
    actors.push(piece(game.exitPosition(level, state), game.open(level, state) ? 'portal open' : 'portal', 'portal-shape'));
    if (level.switch && (level.timedBridge || state.collected.length)) {
      const on = level.timedBridge ? state.bridge > 0 : state.switchOn;
      actors.push(piece(level.switch, on ? 'switch on' : 'switch', 'lever'));
    }
    if (level.returnSwitch) actors.push(piece(level.returnSwitch, state.bridge ? 'switch on' : 'switch', 'lever'));
    level.runes?.forEach((point, index) => {
      const lit = index < state.runesLit;
      const active = !lit && index === state.runesLit && state.collected.length === level.crystals.length;
      actors.push(piece(point, `rune${lit ? ' lit' : active ? ' active' : ''}`, '',
        element('span', 'rune-symbol', lit ? '✓' : index + 1)));
    });
    if (level.energy && !state.energyOn) actors.push(piece(level.energy, 'energy', 'energy-core'));
    for (const actor of state.enemies) {
      const warning = game.patrol(actor, state.turn + 1);
      if (warning && !game.blocked(level, state, warning.point)) {
        actors.push(piece(warning.point, 'warning-tile'));
      }
      actors.push(piece(game.enemyPos(actor), actor.kind, 'creature',
        level.sword ? element('span', 'enemy-health', '♥ ' + actor.hp) : null));
    }
    if (state.effect) actors.push(piece(state.effect.point, 'effect ' + state.effect.type));
    ui.actors.replaceChildren(...actors);

    if (jump) ui.robot.classList.add('jump');
    ui.robot.style.setProperty('--x', state.pos[0] - 1);
    ui.robot.style.setProperty('--y', level.height - state.pos[1]);
    if (jump) requestAnimationFrame(() => requestAnimationFrame(() => ui.robot.classList.remove('jump')));
    labelsX.forEach((item, index) => item.classList.toggle('selected', index + 1 === state.pos[0]));
    labelsY.forEach((item, index) => item.classList.toggle('selected', level.height - index === state.pos[1]));
    ui.board.setAttribute('aria-label', `Labirinto com ${level.width} colunas e ${level.height} linhas. Posição ${game.coord(state.pos)}. Destino ${game.coord(game.nextTarget(level, state))}.`);
  }

  function render(jump = false) {
    renderBoard(jump);
    const [title, instruction] = game.mission(level, state);
    label(ui.objective, title);
    label(ui.instruction, instruction);
    label(ui.position, game.coord(state.pos));
    label(ui.crystals, `${state.collected.length}/${level.crystals.length}`);
    ui['alert-row'].hidden = !level.sword;
    label(ui.alert, `Alerta ${state.alert}/3`);
    label(ui.bonus, `Bônus ${state.bonus}`);
    ui.bridge.hidden = !level.timedBridge;
    if (level.timedBridge) {
      const switches = level.returnSwitch ? `${game.coord(level.switch)} e ${game.coord(level.returnSwitch)}` : game.coord(level.switch);
      label(ui.bridge, state.bridge ? `Ponte aberta · ${state.bridge} ${state.bridge === 1 ? 'turno' : 'turnos'}` :
        `Ponte fechada · ${switches}`);
    }
    label(ui.feedback, state.message || level.tip);
    ui.feedback.dataset.tone = state.tone;
    ui.health.replaceChildren(...Array.from({ length: 3 }, (_, index) => {
      const heart = element('span', index < state.hp ? '' : 'empty', '♥');
      heart.setAttribute('aria-hidden', 'true');
      return heart;
    }));
    ui.health.setAttribute('role', 'img');
    ui.health.setAttribute('aria-label', `${state.hp} de 3 corações`);
    moveButtons.forEach((button) => { button.disabled = state.status !== 'playing'; });
  }

  function load(entry, restored = null) {
    if (!entry || entry.grade !== currentGrade || assignment?.grade !== currentGrade) return;
    if (ui.result.open) ui.result.close();
    level = entry;
    state = restored || game.initial(level);
    renderLevels();
    makeBoard();
    render(true);
    sound.play('start');
  }

  function showResult() {
    const won = state.status === 'won';
    if (won) {
      completed.add(level.id);
      try { localStorage.setItem(storageKey, JSON.stringify(Array.from(completed))); } catch {}
      renderLevels();
    }
    const last = level === currentLevels.at(-1);
    const gradeFinished = completedIn(currentGrade) === currentLevels.length;
    label(ui['result-title'], won ? (gradeFinished ? `${gradeName(currentGrade)} concluído!` : 'Fase concluída!') : 'Vamos tentar de novo?');
    label(ui['result-text'], won ? (gradeFinished ? `Você completou as ${currentLevels.length} fases da série.` :
      `Você coletou ${state.collected.length} de ${level.crystals.length} cristais da missão e abriu o portal.`) :
      state.checkpoint ? 'Seu cristal está salvo. Volte ao ponto em que a ponte caiu.' : 'Observe as casas de perigo e tente outro caminho.');
    label(ui.continue, won ? (last || gradeFinished ? 'Voltar ao menu' : 'Próxima fase') :
      (state.checkpoint ? 'Voltar ao ponto salvo' : 'Tentar de novo'));
    ui.replay.hidden = !won && !state.checkpoint;
    ui.result.showModal();
  }

  function move(direction) {
    if (ui.play.hidden || ui.help.open || ui.result.open || state.status !== 'playing') return;
    const before = state;
    state = game.step(level, before, direction);
    playMoveSound(before, state);
    render();
    if (state.status !== 'playing') showResult();
  }

  function playMoveSound(before, after) {
    if (after.status === 'won') return sound.play('win');
    if (after.status === 'lost') return sound.play('retry');
    if (after.hp < before.hp) return sound.play('hurt');
    const opened = game.open(level, after) && !game.open(level, before);
    if (after.holes.length > before.holes.length) sound.play('collapse');
    else if (!game.same(game.exitPosition(level, before), game.exitPosition(level, after))) sound.play('shift');
    else if (after.collected.length > before.collected.length) sound.play('crystal');
    else if (after.bonus > before.bonus) sound.play('bonus');
    else if (after.runesLit > before.runesLit || after.energyOn !== before.energyOn ||
      after.switchOn !== before.switchOn ||
      (level.timedBridge && !game.same(before.pos, after.pos) &&
      (game.same(after.pos, level.switch) || game.same(after.pos, level.returnSwitch)))) sound.play('switch');
    else if (after.effect?.type === 'slash') {
      sound.play('slash');
      if (after.alert > before.alert) sound.play('alert', .12);
    } else sound.play(after.turn === before.turn ? 'blocked' : 'step');
    if (opened) sound.play('portal', .24);
  }

  function renderSound() {
    for (const button of soundButtons) {
      const status = sound.enabled ? 'Som ligado' : 'Som desligado';
      label(button, button.closest('#play') ? (sound.enabled ? '🔊' : '🔇') : status);
      button.setAttribute('aria-label', status);
      button.title = status;
      button.setAttribute('aria-pressed', String(sound.enabled));
    }
  }

  for (const button of soundButtons) {
    button.addEventListener('click', () => {
      sound.toggle();
      renderSound();
    });
  }

  for (const button of moveButtons) {
    button.addEventListener('click', () => move(button.dataset.move));
  }
  document.addEventListener('keydown', (event) => {
    if (ui.play.hidden || !Object.hasOwn(game.dirs, event.key) || ui.help.open || ui.result.open ||
      event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (event.repeat) return;
    const button = moveButtons.find((item) => item.dataset.move === event.key);
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 120);
    move(event.key);
  });
  ui['help-button'].addEventListener('click', () => ui.help.showModal());
  ui['home-button'].addEventListener('click', showHome);
  ui['change-grade'].addEventListener('click', () => {
    if (!allowChange) openGradeDialog();
    else {
      allowChange = false;
      renderHome();
    }
  });
  ui['grade-form'].addEventListener('submit', submitGrade);
  ui['grade-cancel'].addEventListener('click', () => ui['grade-dialog'].close());
  ui['grade-dialog'].addEventListener('close', () => ui['grade-form'].reset());
  ui.restart.addEventListener('click', () => load(level));
  ui.replay.addEventListener('click', () => load(level));
  ui.result.addEventListener('cancel', (event) => event.preventDefault());
  ui.continue.addEventListener('click', () => {
    if (state.status === 'won') {
      const next = currentLevels[currentLevels.indexOf(level) + 1];
      if (next && completedIn(currentGrade) < currentLevels.length) load(next);
      else showHome();
    } else load(level, game.retry(level, state));
  });

  if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    document.addEventListener('pointermove', (event) => {
      document.documentElement.style.setProperty('--pan-x', `${(event.clientX / innerWidth - .5) * -18}px`);
      document.documentElement.style.setProperty('--pan-y', `${(event.clientY / innerHeight - .5) * -12}px`);
    }, { passive: true });
  }
  renderSound();
  renderHome();
})();
