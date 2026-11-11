(function () {
  'use strict';

  const storageKey = 'caca-aos-cristais-som';
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'off'; } catch {}
  let context;
  let master;
  let foot = 0;

  function prime() {
    if (!enabled) return false;
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return false;
        context = new Audio();
        master = context.createGain();
        master.gain.value = .44;
        master.connect(context.destination);
      }
      if (context.state === 'suspended' || context.state === 'interrupted') {
        context.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  function play(event, delay = 0) {
    if (!prime()) return;
    const time = context.currentTime + .014 + delay;
    function note(frequency, { end = frequency, length = .12, offset = 0, volume = .15, wave = 'sine' } = {}) {
      const start = time + offset;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(end, start + length);
      envelope.gain.setValueAtTime(.0001, start);
      envelope.gain.exponentialRampToValueAtTime(volume, start + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, start + length);
      oscillator.connect(envelope);
      envelope.connect(master);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
      oscillator.start(start);
      oscillator.stop(start + length);
    }
    function melody(frequencies, interval, length, volume = .16) {
      frequencies.forEach((frequency, index) =>
        note(frequency, { offset: index * interval, length, volume, wave: 'triangle' }));
    }
    switch (event) {
      case 'step':
        note([171, 192, 183][foot++ % 3], { end: 109, length: .055, volume: .088 });
        break;
      case 'blocked':
        note(122, { end: 81, length: .11, volume: .13, wave: 'triangle' });
        break;
      case 'select':
        melody([392, 523], .055, .12, .12);
        break;
      case 'start':
        melody([330, 440, 587], .065, .19);
        break;
      case 'crystal':
        melody([523, 659, 784, 1047], .056, .24, .18);
        break;
      case 'bonus':
        melody([587, 880, 1175], .055, .18);
        break;
      case 'slash':
        note(470, { end: 160, length: .15, volume: .15, wave: 'triangle' });
        break;
      case 'alert':
        melody([330, 392], .08, .16, .13);
        break;
      case 'switch':
        melody([294, 440, 659], .075, .21);
        break;
      case 'collapse':
        note(161, { end: 47, length: .26, volume: .22, wave: 'triangle' });
        note(106, { end: 52, offset: .08, length: .26, volume: .14 });
        break;
      case 'hurt':
        note(310, { end: 92, length: .23, volume: .22, wave: 'triangle' });
        break;
      case 'portal':
        melody([392, 523, 659, 784], .081, .27, .17);
        break;
      case 'shift':
        note(370, { end: 740, length: .27, volume: .16 });
        note(550, { end: 420, offset: .08, length: .27, volume: .13, wave: 'triangle' });
        break;
      case 'win':
        melody([523, 659, 784, 1047, 784, 1047], .095, .29, .18);
        note(262, { offset: .47, length: .32, volume: .17 });
        break;
      case 'retry':
        melody([440, 349, 294], .095, .24, .15);
        break;
    }
  }

  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch {}
    if (master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(enabled ? .44 : 0, context.currentTime, .012);
    }
    if (enabled) play('select');
  }

  window.CristaisSound = { prime, play, toggle, get enabled() { return enabled; } };
})();
