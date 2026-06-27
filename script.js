const passages = {
    easy: [
      "The bright sun slowly disappeared behind the tall mountain peaks.",
      "Students gathered quickly outside, waiting for the teacher’s instructions.",
      "My little brother laughed loudly after dropping his toy car.",
    ],
    medium: [
      "During the heavy rain, classmates shared one umbrella, laughing together, while rushing toward the library, making the moment feel warm despite the cold weather.",
      "The nervous student stood in front, holding notes tightly, then spoke confidently, surprising classmates, and earning applause that boosted his courage for future presentations.",
      "During Sunday dinner, everyone shared stories, laughter filled the room, while delicious food brought comfort, reminding them that family moments are always worth cherishing together.",
    ],
    hard: [
      "The group stayed late in the computer lab, finishing their project. Each member contributed ideas, while laughter and teamwork made the stressful night enjoyable. They learned that cooperation, patience, and creativity are the keys to success, proving that even difficult tasks become lighter when shared with friends.",
      "The crowd cheered loudly as the team scored another basket. Players ran across the court with determination, sweat dripping, yet smiles remained. Every pass, every shot, showed their dedication. Victory wasn’t just about winning; it was about unity, effort, and the unforgettable joy of playing together under bright lights.",
      "Friends arrived at the beach early, carrying snacks and towels. The waves crashed gently, inviting them to swim. They built sandcastles, played volleyball, and shared stories. Sunset painted the sky orange, reminding them that simple moments with loved ones create lasting memories, more valuable than anything money could ever buy.",
    ]
  };

  let state = {
    diff: 'easy', chars: [], input: '',
    started: false, finished: false,
    timer: 60, interval: null, startTime: null,
  };

  const passageEl  = document.getElementById('passage-display');
  const inputEl    = document.getElementById('typing-input');
  const wpmEl      = document.getElementById('wpm-display');
  const accEl      = document.getElementById('acc-display');
  const timerEl    = document.getElementById('timer-display');
  const timerRing  = document.getElementById('timer-ring');
  const mainArea   = document.getElementById('main-area');
  const resultArea = document.getElementById('result-area');
  const C = 2 * Math.PI * 18;

  function pickPassage() {
    const pool = passages[state.diff];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderPassage() {
    const chars = state.chars;
    const typed = state.input;

    // Group chars into words + spaces.
    // Each word is wrapped in white-space:nowrap so the browser
    // only breaks at spaces, never mid-word.
    let html = '';
    let i = 0;
    while (i < chars.length) {
      if (chars[i] === ' ') {
        const cls = i < typed.length
          ? (typed[i] === ' ' ? 'correct' : 'wrong')
          : i === typed.length ? 'cursor' : 'pending';
        html += `<span class="char word-space ${cls}"> </span>`;
        i++;
      } else {
        let wordHtml = '<span class="word">';
        while (i < chars.length && chars[i] !== ' ') {
          const cls = i < typed.length
            ? (typed[i] === chars[i] ? 'correct' : 'wrong')
            : i === typed.length ? 'cursor' : 'pending';
          wordHtml += `<span class="char ${cls}">${chars[i]}</span>`;
          i++;
        }
        wordHtml += '</span>';
        html += wordHtml;
      }
    }
    passageEl.innerHTML = html;
  }

  function calcWPM() {
    if (!state.startTime || !state.input.length) return 0;
    const mins = (Date.now() - state.startTime) / 60000;
    const correct = [...state.input].filter((c, i) => c === state.chars[i]).length;
    return Math.round((correct / 5) / mins) || 0;
  }

  function calcAcc() {
    if (!state.input.length) return 100;
    const correct = [...state.input].filter((c, i) => c === state.chars[i]).length;
    return Math.round((correct / state.input.length) * 100);
  }

  function updateRing(t) {
    timerRing.style.strokeDashoffset = C * (1 - t / 60);
  }

  function startTimer() {
    state.startTime = Date.now();
    state.interval = setInterval(() => {
      state.timer--;
      timerEl.textContent = state.timer;
      updateRing(state.timer);
      wpmEl.textContent = calcWPM();
      accEl.textContent = calcAcc() + '%';
      if (state.timer <= 0) finish();
    }, 1000);
  }

  function finish() {
    clearInterval(state.interval);
    state.finished = true;
    inputEl.disabled = true;
    const wpm = calcWPM();
    const acc = calcAcc();
    const correct = [...state.input].filter((c, i) => c === state.chars[i]).length;
    document.getElementById('r-wpm').textContent = wpm;
    document.getElementById('r-acc').textContent = acc + '%';
    document.getElementById('r-chars').textContent = correct;
    const titles = wpm >= 80
      ? ['Espresso shot!', 'Blazing fast.']
      : wpm >= 50
      ? ['Well brewed!', 'Solid pour.']
      : ['Slow steep.', 'Take your time.'];
    const sub = wpm >= 80
      ? 'You type faster than the beans grind.'
      : wpm >= 50
      ? 'A satisfying result. The café approves.'
      : 'Every great barista started somewhere.';
    document.getElementById('result-title').textContent = titles[Math.floor(Math.random() * titles.length)];
    document.getElementById('result-sub').textContent = sub;
    mainArea.style.display = 'none';
    resultArea.style.display = 'flex';
  }

  function init() {
    clearInterval(state.interval);
    const passage = pickPassage();
    state = {
      ...state,
      chars: passage.split(''),
      input: '',
      started: false,
      finished: false,
      timer: 60,
      interval: null,
      startTime: null,
    };
    inputEl.value = '';
    inputEl.disabled = false;
    timerEl.textContent = '60';
    wpmEl.textContent = '–';
    accEl.textContent = '–';
    updateRing(60);
    mainArea.style.display = 'block';
    resultArea.style.display = 'none';
    renderPassage();
    inputEl.focus();
  }

  inputEl.addEventListener('input', e => {
    if (state.finished) return;
    const val = e.target.value;
    if (!state.started && val.length > 0) {
      state.started = true;
      startTimer();
    }
    state.input = val;
    wpmEl.textContent = calcWPM() || '–';
    accEl.textContent = state.input.length ? calcAcc() + '%' : '–';
    renderPassage();
    if (val.length >= state.chars.length) finish();
  });

  document.getElementById('reset-btn').addEventListener('click', init);
  document.getElementById('retry-btn').addEventListener('click', init);

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.diff = btn.dataset.diff;
      init();
    });
  });

  init();