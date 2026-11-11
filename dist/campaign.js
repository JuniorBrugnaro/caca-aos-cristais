(function () {
  'use strict';

  // Width and height include the paths along the outside of each island.
  const chapters = [
    [
      ['Trilha do lago', 7, 5, 12, 1, {}],
      ['Jardim das curvas', 7, 5, 14, 1, {}],
      ['Dois brilhos na clareira', 7, 7, 16, 2, {}],
      ['O caracol de pedra', 7, 7, 19, 2, {}],
      ['Caminho das lanternas', 9, 7, 22, 2, {}],
      ['Ilha do eco', 9, 7, 25, 2, {}],
      ['Farol dos cristais', 9, 7, 28, 3, {}],
    ],
    [
      ['O bilhete do carteiro', 7, 7, 21, 3, { patrols: 1 }],
      ['Rotas cruzadas', 9, 7, 23, 3, { patrols: 2 }],
      ['A ronda do pomar', 9, 7, 26, 3, { patrols: 2 }],
      ['Circuito de quatro cristais', 9, 7, 28, 4, { patrols: 2 }],
      ['Volta ao observatório', 9, 9, 31, 4, { patrols: 3 }],
      ['Estação das gelecas', 9, 9, 34, 4, { patrols: 3 }],
      ['Expedição das coordenadas', 9, 9, 37, 5, { patrols: 3 }],
    ],
    [
      ['Luz entre as colunas', 9, 7, 27, 2, { patrols: 2, sentry: 'slime' }],
      ['O corredor dos besouros', 9, 9, 29, 2, { patrols: 2, sentry: 'beetle' }],
      ['Patrulhas em cruz', 9, 9, 32, 3, { patrols: 3, sentry: 'beetle' }],
      ['A sala dos escudos', 9, 9, 34, 3, { patrols: 3, sentry: 'guardian' }],
      ['O labirinto dos besouros', 11, 7, 37, 3, { patrols: 3, sentry: 'guardian' }],
      ['O desafio dos guardiões', 11, 9, 40, 4, { patrols: 4, sentry: 'guardian' }],
      ['Vigília da espada', 11, 9, 43, 4, { patrols: 4, sentry: 'guardian' }],
    ],
    [
      ['O portal inquieto', 9, 7, 25, 2, { patrols: 1, shift: true, spikes: 2 }],
      ['Os degraus que somem', 9, 9, 28, 2, { patrols: 1, fragile: 3, spikes: 2 }],
      ['Pulso na tempestade', 9, 9, 31, 3, { patrols: 2, energy: true, fragile: 2, spikes: 3 }],
      ['Selo na neblina', 9, 9, 34, 3, { patrols: 2, runes: 1, fragile: 2, spikes: 3 }],
      ['Portais ao vento', 11, 9, 37, 3, { patrols: 2, shift: true, runes: 1, spikes: 4 }],
      ['O labirinto que encolhe', 11, 9, 40, 3, { patrols: 3, energy: true, fragile: 4, runes: 2, spikes: 4 }],
      ['A ilha das três pistas', 11, 9, 43, 4, { patrols: 3, shift: true, runes: 3, fragile: 3, spikes: 5 }],
    ],
    [
      ['Ponte do relógio', 9, 9, 28, 3, { patrols: 2, bridge: 5, runes: 1, spikes: 2 }],
      ['Fortaleza dos selos', 9, 9, 32, 3, { patrols: 2, energy: true, runes: 2, sentry: 'guardian', spikes: 3 }],
      ['A rota de volta', 11, 7, 35, 3, { patrols: 3, bridge: 5, shift: true, fragile: 2, spikes: 3 }],
      ['Duas margens', 11, 9, 38, 4, { patrols: 3, bridge: 4, runes: 2, fragile: 3, spikes: 4 }],
      ['O farol em fuga', 11, 9, 41, 4, { patrols: 3, shift: true, energy: true, runes: 2, sentry: 'guardian', spikes: 4 }],
      ['Última ronda', 11, 9, 45, 4, { patrols: 4, bridge: 4, runes: 3, sentry: 'guardian', fragile: 3, spikes: 5 }],
      ['O coração das ilhas', 11, 9, 49, 5, { patrols: 4, bridge: 4, shift: true, runes: 3, sentry: 'guardian', fragile: 4, spikes: 6 }],
    ],
  ];

  const tag = ([x, y]) => x + ',' + y;
  const coordinate = ([x, y]) => `(${x}, ${y})`;
  const adjacent = ([x, y], distance = 1) =>
    [[x + distance, y], [x - distance, y], [x, y + distance], [x, y - distance]];

  function randomFor(seed) {
    return (limit) => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return Math.floor(seed / 4294967296 * limit);
    };
  }

  function shuffled(items, random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = random(index + 1);
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function walk(floor, start) {
    const queue = [start];
    const previous = new Map([[tag(start), null]]);
    for (let index = 0; index < queue.length; index += 1) {
      const point = queue[index];
      for (const next of adjacent(point)) {
        const id = tag(next);
        if (!floor.has(id) || previous.has(id)) continue;
        previous.set(id, point);
        queue.push(next);
      }
    }
    return { queue, previous };
  }

  function pathTo(previous, point) {
    const path = [];
    for (let cursor = point; cursor; cursor = previous.get(tag(cursor))) path.push(cursor);
    return path.reverse();
  }

  function carve(width, height, start, random) {
    const floor = new Set([tag(start)]);
    const stack = [start];
    while (stack.length) {
      const point = stack.at(-1);
      const options = adjacent(point, 2).filter(([x, y]) =>
        x >= 1 && x <= width && y >= 1 && y <= height && !floor.has(tag([x, y])));
      if (!options.length) {
        stack.pop();
        continue;
      }
      const next = options[random(options.length)];
      floor.add(tag([(point[0] + next[0]) / 2, (point[1] + next[1]) / 2]));
      floor.add(tag(next));
      stack.push(next);
    }
    const { queue, previous } = walk(floor, start);
    return { floor, path: pathTo(previous, queue.at(-1)) };
  }

  function makeIsland(grade, phase, width, height, distance) {
    const random = randomFor(grade * 10003 + phase * 701);
    const corners = [[1, 1], [width, 1], [1, height], [width, height]];
    const start = corners[(grade + phase) % corners.length];
    const cells = Array.from({ length: width * height }, (_, index) =>
      [index % width + 1, Math.floor(index / width) + 1]);
    let island = { path: [] };
    for (let attempt = 0; attempt < 48; attempt += 1) {
      const candidate = carve(width, height, start, random);
      if (candidate.path.length > island.path.length) island = candidate;
      if (island.path.length >= distance + 1) break;
    }
    return { ...island, path: island.path.slice(0, distance + 1), cells, random };
  }

  function objectives(path, count, reserved) {
    const available = path.map((_, index) => index).slice(3, -4).filter((index) => !reserved.has(index));
    return Array.from({ length: count }, (_, index) => {
      const offset = Math.floor((index + 1) * (available.length - 1) / (count + 1));
      const chosen = available[offset];
      reserved.add(chosen);
      return path[chosen];
    });
  }

  function tips(level) {
    if (level.timedBridge) return `Ative a ponte em ${coordinate(level.switch)}. Ela fica aberta por ${level.bridgeTurns} turnos.`;
    if (level.energy) return `Pise na casa de energia em ${coordinate(level.energy)} para abrir passagem.`;
    if (level.exitShift) return 'Observe o painel depois do último cristal. O portal pode mudar de lugar.';
    if (level.runes) return 'Depois dos cristais, ative os selos na ordem que o painel mostrar.';
    if (level.spikes) return 'O laranja indica onde os espinhos vão subir no próximo turno.';
    if (level.sword) return 'Cada ataque conta como um turno. Observe as patrulhas antes de avançar.';
    if (level.ordered) return 'Siga a ordem do painel e observe a casa marcada antes de atravessar.';
    return 'Leia primeiro a coluna e depois a linha. Procure uma passagem até a coordenada.';
  }

  function build(grade, phase, recipe) {
    const [title, width, height, distance, count, features] = recipe;
    const { floor, path, cells, random } = makeIsland(grade, phase, width, height, distance);
    const route = new Set(path.map(tag));
    const last = path.length - 1;
    const reserved = new Set([0, last]);
    const level = { id: `${grade}-${phase}`, grade, title, width, height, start: path[0], exit: path[last] };
    if (grade >= 3) level.sword = true;
    if (grade >= 2 && count > 1 && grade !== 3) level.ordered = true;

    // Bridge controls on both banks let students return if they miss a crystal.
    if (features.bridge) {
      const index = Math.floor(last * .42);
      const controls = [index - 2, index, index + 2];
      controls.forEach((offset) => reserved.add(offset));
      [level.switch, level.timedBridge, level.returnSwitch] = controls.map((offset) => path[offset]);
      level.bridgeTurns = features.bridge;
    }
    if (features.energy) {
      const index = Math.floor(last * .38);
      reserved.add(index - 1);
      reserved.add(index);
      level.energy = path[index - 1];
      level.breakable = [path[index]];
    }
    if (features.runes) {
      const indices = Array.from({ length: features.runes }, (_, index) => last - (features.runes - index) * 2);
      indices.forEach((index) => reserved.add(index));
      level.runes = indices.map((index) => path[index]);
    }
    level.crystals = objectives(path, count, reserved);
    const sidePaths = shuffled(cells.filter((point) => floor.has(tag(point)) && !route.has(tag(point))), random);
    const used = new Set(path.map(tag));
    if (features.shift && sidePaths.length) {
      level.exitShift = level.exit;
      level.exit = sidePaths[0];
      used.add(tag(level.exit));
    }
    level.enemies = [];
    if (grade === 2) {
      const crossings = phase >= 8 ? 2 : 1;
      for (let index = 5; index < last - 2 && level.enemies.length < crossings; index += 4) {
        if (reserved.has(index)) continue;
        const point = path[index];
        const alcove = adjacent(point).find((cell) => floor.has(tag(cell)) && !used.has(tag(cell)));
        if (!alcove) continue;
        level.enemies.push({ kind: 'slime', path: [alcove, point] });
        used.add(tag(alcove));
      }
    }
    let sentryAt = last;
    if (features.sentry) {
      const index = path.findIndex(([x], offset) => offset >= Math.floor(last * .52) && offset < last - 3 &&
        !reserved.has(offset) && (features.sentry !== 'guardian' || path[offset - 1][0] >= x));
      if (index >= 0) {
        sentryAt = index;
        reserved.add(index);
        level.enemies.push({ kind: features.sentry, path: [path[index]] });
      }
    }
    const enemyCount = (features.patrols || 0) + Number(sentryAt < last);
    for (const point of sidePaths) {
      if (level.enemies.length >= enemyCount) break;
      const next = adjacent(point).find((cell) => floor.has(tag(cell)) && !used.has(tag(cell)));
      if (used.has(tag(point)) || !next) continue;
      const kind = grade >= 3 && level.enemies.length % 2 ? 'beetle' : 'slime';
      level.enemies.push({ kind, path: [point, next] });
      used.add(tag(point));
      used.add(tag(next));
    }
    if (grade >= 3) {
      for (let index = Math.floor(last * .65); index < last - 2 && level.enemies.length < enemyCount; index += 1) {
        if (reserved.has(index)) continue;
        level.enemies.push({ kind: 'slime', path: [path[index]] });
        reserved.add(index);
        sentryAt = Math.min(sentryAt, index);
      }
    }
    if (features.fragile) {
      const early = features.fragile > 2 ? [path[2], path[3]] : [path[2]];
      const detours = sidePaths.filter((point) => !used.has(tag(point))).slice(0, features.fragile - early.length);
      level.fragile = [...early, ...detours];
      level.fragile.forEach((point) => used.add(tag(point)));
    }
    if (features.spikes) {
      level.spikePeriod = grade === 5 || phase >= 7 ? 3 : 2;
      level.spikes = [];
      level.spikePhases = {};
      for (let index = 4; index < sentryAt - 1 && level.spikes.length < features.spikes; index += 4) {
        if (reserved.has(index)) continue;
        const point = path[index];
        level.spikes.push(point);
        level.spikePhases[tag(point)] = (level.spikePeriod + 1 - index % level.spikePeriod) % level.spikePeriod;
      }
    }
    // Open some side loops without shortening the main route or bypassing its gates.
    let shortcuts = phase < 8 ? 2 : 4;
    for (const wall of shuffled(cells.filter((point) => !floor.has(tag(point))), random)) {
      if (!shortcuts) break;
      const exits = adjacent(wall).filter((point) => floor.has(tag(point)));
      if (exits.length !== 2 || exits.some((point) => used.has(tag(point)))) continue;
      const branch = new Set([...floor].filter((cell) => !route.has(cell)));
      if (!walk(branch, exits[0]).previous.has(tag(exits[1]))) continue;
      floor.add(tag(wall));
      shortcuts -= 1;
    }
    level.walls = cells.filter((point) => !floor.has(tag(point)));
    level.tip = tips(level);
    return level;
  }

  const campaign = chapters.flatMap((phases, index) => phases.map((phase, offset) => build(index + 1, offset + 4, phase)));
  if (typeof module !== 'undefined' && module.exports) module.exports = campaign;
  else window.CristaisCampaign = campaign;
})();
