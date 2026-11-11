(function () {
  'use strict';

  const original = [
    {
      id: '1', grade: 1, title: 'Primeiros passos', width: 5, height: 5,
      start: [1, 1], exit: [5, 5], crystals: [[4, 3]],
      walls: [[2, 2], [2, 4], [3, 4], [5, 2]],
      guide: [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3]],
      tip: 'Primeiro a coluna. Depois a linha. Siga as casas iluminadas.',
    },
    {
      id: '1-2', grade: 1, title: 'A volta do jardim', width: 5, height: 5,
      start: [1, 1], exit: [5, 3], crystals: [[2, 4]],
      walls: [[2, 1], [2, 2], [3, 3], [3, 4], [4, 4]],
      guide: [[1, 1], [1, 2], [1, 3], [2, 3], [2, 4]],
      tip: 'Suba pela coluna 1. Depois, vá à direita para chegar à coluna 2.',
    },
    {
      id: '1-3', grade: 1, title: 'O cristal do mirante', width: 6, height: 5,
      start: [1, 1], exit: [6, 5], crystals: [[5, 4]],
      walls: [[2, 2], [2, 3], [3, 3], [4, 1], [4, 2], [4, 4], [5, 2], [6, 3]],
      tip: 'Ache a coluna 5 e a linha 4. Planeje o caminho até o encontro delas.',
    },
    {
      id: '2', grade: 2, title: 'Cristais em ordem', width: 6, height: 5,
      start: [1, 1], exit: [6, 5], crystals: [[2, 2], [5, 4]], ordered: true,
      walls: [[1, 4], [2, 4], [4, 1], [4, 2], [4, 5], [5, 3]],
      enemies: [{ kind: 'slime', path: [[6, 2], [6, 3]] }],
      tip: 'Encontre os dois cristais na ordem indicada. Observe a geleca antes de passar.',
    },
    {
      id: '2-2', grade: 2, title: 'O caminho em zigue-zague', width: 6, height: 5,
      start: [1, 1], exit: [1, 5], crystals: [[4, 1], [3, 4]], ordered: true,
      walls: [[1, 3], [2, 2], [2, 3], [3, 2], [4, 3], [4, 4], [5, 1], [5, 4]],
      enemies: [{ kind: 'slime', path: [[5, 2], [6, 2], [6, 3]] }],
      tip: 'O primeiro cristal fica na linha de partida. Para o segundo, mude de coluna e de linha.',
    },
    {
      id: '2-3', grade: 2, title: 'Três paradas na ilha', width: 7, height: 5,
      start: [1, 1], exit: [7, 5], crystals: [[2, 4], [7, 1], [6, 4]], ordered: true,
      walls: [[1, 3], [3, 1], [3, 2], [3, 4], [4, 4], [6, 1], [7, 3]],
      enemies: [{ kind: 'slime', path: [[4, 2], [4, 1]] }, { kind: 'slime', path: [[6, 5], [5, 5]] }],
      tip: 'Depois de cada coleta, leia a próxima coordenada no painel. Observe as gelecas antes de avançar.',
    },
    {
      id: '3', grade: 3, title: 'A espada de luz', width: 7, height: 5,
      start: [3, 2], exit: [7, 5], crystals: [[6, 4]], sword: true,
      walls: [[2, 2], [2, 3], [3, 4], [4, 3], [5, 3], [7, 2]],
      enemies: [{ kind: 'slime', path: [[4, 2], [5, 2]] }, { kind: 'beetle', path: [[4, 5], [5, 5], [6, 5]] }],
      tip: 'Aperte a seta na direção de um monstro ao lado para atacar. Observe o aviso antes da investida.',
    },
    {
      id: '3-2', grade: 3, title: 'A patrulha dos besouros', width: 7, height: 6,
      start: [1, 1], exit: [7, 6], crystals: [[4, 2], [6, 5]], sword: true,
      walls: [[1, 3], [2, 3], [3, 2], [3, 4], [4, 4], [5, 2], [5, 4], [6, 2], [7, 4]],
      enemies: [{ kind: 'beetle', path: [[4, 2], [4, 3], [5, 3]] }, { kind: 'slime', path: [[2, 5], [3, 5]] }],
      tip: 'A casa marcada com ! indica o próximo movimento do monstro. Planeje antes de atacar.',
    },
    {
      id: '3-3', grade: 3, title: 'O guardião do cristal', width: 8, height: 6,
      start: [2, 2], exit: [8, 6], crystals: [[5, 2], [7, 5]], sword: true,
      walls: [[2, 1], [2, 4], [3, 4], [4, 1], [4, 4], [5, 3], [6, 3], [6, 5], [7, 2], [8, 3]],
      enemies: [{ kind: 'guardian', path: [[4, 2]] }, { kind: 'slime', path: [[3, 2], [3, 3]] }, { kind: 'beetle', path: [[7, 4], [8, 4], [8, 5]] }],
      tip: 'O guardião protege a frente. Contorne pela linha 3 para chegar ao lado do escudo.',
    },
    {
      id: '4', grade: 4, title: 'O caminho mudou', width: 8, height: 6,
      start: [2, 2], exit: [8, 6], crystals: [[7, 5]], sword: true,
      walls: [[1, 4], [2, 4], [3, 2], [3, 3], [3, 5], [4, 2], [5, 4], [7, 2], [7, 3], [8, 4]],
      fragile: [[2, 3], [4, 3]],
      spikes: [[5, 3], [6, 3], [7, 4]],
      energy: [4, 5], breakable: [[5, 5]],
      enemies: [{ kind: 'slime', path: [[8, 2], [8, 3]] }],
      tip: 'O piso rachado desaba depois da passagem. A casa de energia em (4, 5) abre caminho.',
    },
    {
      id: '4-2', grade: 4, title: 'O ritmo dos espinhos', width: 8, height: 6,
      start: [1, 1], exit: [8, 6], crystals: [[3, 5], [7, 2]], sword: true,
      walls: [[1, 3], [2, 3], [3, 2], [4, 2], [4, 4], [4, 5], [6, 1], [6, 4], [7, 4], [8, 4]],
      fragile: [[3, 3], [5, 5]], spikes: [[4, 3], [5, 3], [6, 3], [7, 3]],
      enemies: [{ kind: 'beetle', path: [[6, 5], [7, 5], [8, 5]] }],
      tip: 'O laranja marca onde os espinhos subirão no próximo turno. Use as laterais para ajustar seu passo.',
    },
    {
      id: 'surpresa', grade: 4, title: 'Ponte das nuvens', width: 7, height: 5,
      start: [1, 1], exit: [7, 5], crystals: [[5, 3]], sword: true,
      walls: [[1, 3], [4, 1], [4, 3], [4, 4], [5, 4], [6, 2], [7, 3]],
      collapse: [4, 2], switch: [2, 4],
      ambush: { kind: 'beetle', path: [[6, 3], [6, 4]] },
      tip: 'Pegue o cristal e siga a nova pista. Se precisar, volte ao último ponto salvo.',
    },
    {
      id: '5', grade: 5, title: 'Uma ponte, poucos turnos', width: 8, height: 6,
      start: [3, 2], exit: [8, 6], crystals: [[6, 3], [7, 5]], sword: true,
      walls: [[1, 2], [2, 2], [2, 3], [4, 3], [5, 2], [5, 3], [5, 5], [5, 6], [6, 2], [7, 4], [8, 4]],
      spikes: [[3, 6], [4, 6], [7, 2]], timedBridge: [5, 4], switch: [2, 4],
      enemies: [{ kind: 'guardian', path: [[4, 2]] }, { kind: 'beetle', path: [[6, 5], [7, 5], [8, 5]] }],
      tip: 'Ative (2, 4) para abrir a ponte por cinco turnos. Contorne o escudo do guardião.',
    },
    {
      id: '5-2', grade: 5, title: 'O pulso da fortaleza', width: 8, height: 6,
      start: [1, 1], exit: [8, 6], crystals: [[2, 5], [6, 2], [7, 5]], ordered: true, sword: true,
      walls: [[1, 4], [2, 2], [3, 2], [3, 4], [4, 1], [4, 2], [4, 4], [4, 5], [4, 6], [6, 4], [7, 3]],
      energy: [3, 3], breakable: [[4, 3]], fragile: [[5, 2]], spikes: [[5, 4], [6, 3], [7, 4]],
      enemies: [{ kind: 'guardian', path: [[5, 5]] }, { kind: 'beetle', path: [[7, 2], [8, 2], [8, 3]] }],
      tip: 'Recolha os três cristais em ordem. O pulso em (3, 3) abre a passagem para o outro lado.',
    },
    {
      id: '5-3', grade: 5, title: 'A última travessia', width: 9, height: 6,
      start: [1, 1], exit: [9, 6], crystals: [[3, 5], [7, 2], [8, 5]], ordered: true, sword: true,
      walls: [[1, 4], [2, 2], [3, 2], [5, 1], [5, 2], [5, 3], [5, 5], [5, 6], [6, 3], [8, 3]],
      timedBridge: [5, 4], switch: [3, 4], fragile: [[7, 3]], spikes: [[7, 5], [6, 4], [8, 4]],
      enemies: [{ kind: 'guardian', path: [[6, 5]] }, { kind: 'beetle', path: [[8, 2], [9, 2]] }],
      tip: 'Pegue o primeiro cristal antes de cruzar. Ative (3, 4) e conte os turnos até o outro lado.',
    },
  ];

  const added = typeof module !== 'undefined' && module.exports ? require('./campaign.js') : window.CristaisCampaign;
  const levels = [...original, ...added].sort((a, b) => a.grade - b.grade);

  const dirs = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const species = {
    slime: { name: 'Geleca', hp: 1, interval: 2 },
    beetle: { name: 'Besouro', hp: 2, interval: 3 },
    guardian: { name: 'Guardião', hp: 2, interval: 1 },
  };
  const key = (point) => point.join(',');
  const same = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  const contains = (points, point) => points?.some((other) => same(other, point));
  const coord = ([x, y]) => `(${x}, ${y})`;
  const enemy = (spec) => ({ ...spec, index: 0, direction: 1, hp: species[spec.kind].hp });
  const enemyPos = (actor) => actor.path[actor.index];
  const allCrystals = (level, state) => state.collected.length === level.crystals.length;
  const exitPosition = (level, state) => level.exitShift && allCrystals(level, state) ? level.exitShift : level.exit;
  const open = (level, state) => allCrystals(level, state) &&
    (!level.collapse || state.switchOn) && state.runesLit === (level.runes?.length || 0);

  function initial(level) {
    return {
      pos: level.start, turn: 0, hp: 3, alert: 0, collected: [], loot: [], bonus: 0,
      enemies: (level.enemies || []).map(enemy), holes: [], bridge: 0, bridgeEntry: null,
      switchOn: false, energyOn: false, runesLit: 0,
      status: 'playing', message: '', tone: '', checkpoint: null, effect: null,
    };
  }

  function blocked(level, state, [x, y]) {
    const point = [x, y];
    return x < 1 || y < 1 || x > level.width || y > level.height ||
      contains(level.walls, point) || contains(state.holes, point) ||
      (!state.energyOn && contains(level.breakable, point)) ||
      (same(level.timedBridge, point) && state.bridge === 0);
  }

  function spikeActive(level, point, turn) {
    const index = (level.spikes || []).findIndex((tile) => same(tile, point));
    return index >= 0 && (turn + (level.spikePhases?.[key(point)] ?? index)) % (level.spikePeriod || 2) === 0;
  }

  function patrol(actor, turn) {
    if (actor.path.length < 2 || turn % species[actor.kind].interval !== 0) return null;
    let direction = actor.direction;
    if (!actor.path[actor.index + direction]) direction *= -1;
    return { index: actor.index + direction, direction, point: actor.path[actor.index + direction] };
  }

  function nextTarget(level, state) {
    if (level.collapse && state.collected.length && !state.switchOn) return level.switch;
    return level.crystals.find((point) => !state.collected.includes(key(point))) ||
      level.runes?.[state.runesLit] || exitPosition(level, state);
  }

  function mission(level, state) {
    const target = coord(nextTarget(level, state));
    if (open(level, state)) return ['Portal aberto!', `Chegue à saída em ${target}.`];
    if (level.collapse && state.collected.length) return ['A ponte caiu!', `Ative o interruptor em ${target}.`];
    if (allCrystals(level, state) && level.runes) {
      return [`Selo ${state.runesLit + 1} de ${level.runes.length}`, `Pise no selo em ${target} para abrir a saída.`];
    }
    if (level.ordered) return [`Cristal ${state.collected.length + 1} de ${level.crystals.length}`, `Colete na ordem. Próximo: ${target}.`];
    const remaining = level.crystals.length - state.collected.length;
    return [remaining === 1 ? `Cristal em ${target}` : `${remaining} cristais`, level.crystals.length === 1
      ? 'Encontre a coluna e a linha na grade.'
      : level.crystals.filter((point) => !state.collected.includes(key(point))).map(coord).join(' e ')];
  }

  function say(state, message, tone = '') {
    state.message = message;
    state.tone = tone;
  }

  function step(level, previous, direction) {
    if (previous.status !== 'playing' || !dirs[direction]) return previous;
    const state = structuredClone(previous);
    state.effect = null;
    say(state, '');
    const [dx, dy] = dirs[direction];
    const [x, y] = state.pos;
    const target = [x + dx, y + dy];
    if (blocked(level, state, target)) {
      say(state, same(level.timedBridge, target) ? 'A ponte está fechada. Ative o interruptor.' :
        contains(state.holes, target) ? 'O piso caiu. Procure outro caminho.' : 'O caminho está bloqueado.', 'warn');
      return state;
    }
    if (same(exitPosition(level, state), target) && !open(level, state)) {
      say(state, 'O portal abre quando a missão estiver completa.', 'warn');
      return state;
    }
    const rival = state.enemies.find((actor) => same(enemyPos(actor), target));
    if (rival && !level.sword) {
      say(state, 'Tem uma geleca aí. Escolha outro caminho.', 'warn');
      return state;
    }

    state.turn += 1;
    let checkpoint = false;
    let openedBridge = false;
    let hurt = '';
    if (rival) {
      state.effect = { type: 'slash', point: target };
      if (rival.kind === 'guardian' && dx === 1) {
        say(state, 'O escudo protege a frente. Contorne o guardião.', 'warn');
      } else if (--rival.hp <= 0) {
        state.enemies = state.enemies.filter((actor) => actor !== rival);
        state.loot.push(target);
        if (state.alert < 3) {
          state.alert += 1;
          state.enemies.forEach((actor) => { actor.hp += 1; });
        }
        say(state, state.enemies.length ? 'Cristal bônus no chão. Os monstros restantes ficaram mais resistentes.' :
          'O monstro deixou um cristal bônus!', 'good');
      } else {
        say(state, `${species[rival.kind].name}: resistência ${rival.hp}.`, 'good');
      }
    } else {
      if (contains(level.fragile, state.pos)) state.holes.push(state.pos);
      state.pos = target;
      if (same(level.timedBridge, target)) state.bridgeEntry = previous.pos;
      if (same(level.energy, target) && !state.energyOn) {
        state.energyOn = true;
        state.effect = { type: 'energy', point: target };
        say(state, 'O pulso de energia abriu o caminho ao lado!', 'good');
      }
      if (contains(state.loot, target)) {
        state.bonus += 1;
        state.loot = state.loot.filter((point) => !same(point, target));
        say(state, 'Cristal bônus coletado!', 'good');
      }
      if (contains(level.crystals, target) && !state.collected.includes(key(target))) {
        if (level.ordered && !same(target, nextTarget(level, state))) {
          say(state, `Primeiro pegue o cristal em ${coord(nextTarget(level, state))}.`, 'warn');
        } else {
          state.collected.push(key(target));
          state.effect = { type: 'collect', point: target };
          say(state, `Cristal encontrado em ${coord(target)}!`, 'good');
          if (level.exitShift && allCrystals(level, state)) {
            say(state, `O portal mudou para ${coord(level.exitShift)}!`, 'warn');
          }
          if (level.collapse) {
            state.holes.push(level.collapse);
            state.enemies.push(enemy(level.ambush));
            checkpoint = true;
            say(state, `A ponte caiu! Procure o interruptor em ${coord(level.switch)}.`, 'warn');
          }
        }
      }
      const isRune = level.runes?.findIndex((point) => same(point, target)) ?? -1;
      if (isRune >= state.runesLit) {
        if (!allCrystals(level, state)) say(state, 'Colete os cristais antes de ativar os selos.', 'warn');
        else if (isRune === state.runesLit) {
          state.runesLit += 1;
          state.effect = { type: 'energy', point: target };
          say(state, `Selo ${state.runesLit} de ${level.runes.length} ativado!`, 'good');
        } else {
          say(state, `Primeiro ative o selo em ${coord(level.runes[state.runesLit])}.`, 'warn');
        }
      }
      if ((same(level.switch, target) || same(level.returnSwitch, target)) && (level.timedBridge || state.collected.length)) {
        state.switchOn = true;
        if (level.timedBridge) {
          state.bridge = level.bridgeTurns || 5;
          openedBridge = true;
          say(state, `Ponte aberta por ${state.bridge} turnos!`, 'good');
        } else {
          say(state, 'Passagem aberta! Agora vá ao portal.', 'good');
        }
      }
      if (same(exitPosition(level, state), target) && open(level, state)) {
        state.status = 'won';
        say(state, 'Fase concluída!', 'good');
        return state;
      }
    }

    if (spikeActive(level, state.pos, state.turn)) hurt = 'Os espinhos subiram nessa casa.';
    for (const actor of state.enemies) {
      const move = patrol(actor, state.turn);
      if (!move || blocked(level, state, move.point) ||
        state.enemies.some((other) => other !== actor && same(enemyPos(other), move.point))) continue;
      if (same(move.point, state.pos)) {
        hurt ||= `${species[actor.kind].name} alcançou essa casa.`;
      } else {
        actor.index = move.index;
        actor.direction = move.direction;
      }
    }
    if (state.bridge > 0 && !openedBridge) {
      state.bridge -= 1;
      if (!state.bridge && same(state.pos, level.timedBridge)) {
        state.pos = state.bridgeEntry || previous.pos;
        hurt ||= 'A ponte fechou. Você voltou uma casa.';
      }
    }
    if (hurt) {
      state.hp -= 1;
      state.effect = { type: 'hurt', point: state.pos };
      say(state, hurt, 'warn');
      if (state.hp <= 0) state.status = 'lost';
    }
    if (checkpoint && state.status === 'playing') {
      state.checkpoint = structuredClone({ ...state, hp: 3, checkpoint: null, effect: null });
    }
    return state;
  }

  function retry(level, state) {
    if (!state.checkpoint) return initial(level);
    return { ...structuredClone(state.checkpoint), checkpoint: structuredClone(state.checkpoint) };
  }

  const game = { levels, dirs, species, key, same, contains, coord, initial, step, retry, open, blocked, enemyPos, patrol, spikeActive, nextTarget, mission, exitPosition };
  if (typeof module !== 'undefined' && module.exports) module.exports = game;
  else window.Cristais = game;
})();
