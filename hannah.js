;(function () {
  'use strict'
  document.documentElement.classList.add('hannah')
  if (!localStorage.getItem('hannah.initialized')) {
    localStorage.setItem('codex.theme', 'light')
    localStorage.setItem('codex.bg', 'mesh')
    localStorage.setItem('hannah.initialized', '1')
  }
  function boot() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    // Each kitty is an original vector sticker, crisp at every screen size.
    function kitty(color, bow) {
      return '<svg class="hm-kitty" viewBox="0 0 160 155" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<ellipse cx="80" cy="141" rx="48" ry="7" fill="#bd54a5" opacity=".16"/>' +
        '<path d="M111 110 Q153 90 144 121 Q136 138 119 128" stroke="#985283" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M111 110 Q153 90 144 121 Q136 138 119 128" stroke="' + color + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M49 102 Q36 144 66 140 L98 140 Q124 144 111 102" fill="' + color + '" stroke="#985283" stroke-width="3"/>' +
        '<ellipse cx="80" cy="120" rx="17" ry="18" fill="#fff5fb"/>' +
        '<path d="M30 65 26 19 Q27 10 37 17 L58 35 Q80 27 102 35 L123 17 Q134 10 134 23 L130 65 Q143 104 81 110 Q17 105 30 65Z" fill="' + color + '" stroke="#985283" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="m34 27 5 26 13-12Z M125 27l-5 26-13-12Z" fill="#ffa8d1"/>' +
        '<ellipse cx="49" cy="80" rx="12" ry="7" fill="#ff8cc3" opacity=".65"/><ellipse cx="111" cy="80" rx="12" ry="7" fill="#ff8cc3" opacity=".65"/>' +
        '<path d="M54 68q5-8 10 0M96 68q5-8 10 0" stroke="#683b66" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="m75 77 5 5 5-5Z" fill="#d75a9b"/><path d="M80 82v5q-7 8-13 0m13 0q7 8 13 0" stroke="#683b66" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="m39 76-20-4m21 12-21 3m102-11 20-4m-21 12 21 3" stroke="#985283" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M98 34Q86 12 105 18L118 27Q141 10 140 29L126 40Z" fill="' + bow + '" stroke="#b13c8c" stroke-width="2"/><circle cx="118" cy="30" r="6" fill="#ffed9f"/>' +
        '<path d="M53 126v11m8-11v12m39-12v12m7-12v11" stroke="#985283" stroke-width="2" stroke-linecap="round"/></svg>'
    }
    const decor = document.createElement('div')
    decor.id = 'hm-maximalism'; decor.setAttribute('aria-hidden', 'true')
    decor.innerHTML = '<div class="hm-corner hm-corner-top"><span class="hm-charm">🎀</span><span>✧</span><span>💎</span><span>♡</span><span>🎀</span></div>' +
      '<div class="hm-cat-sticker hm-cat-right">' + kitty('#fff4fb', '#f26cb7') + '<b>100% meow-powered</b></div>' +
      '<div class="hm-cat-sticker hm-cat-left">' + kitty('#eed5ff', '#e777c5') + '<b>слишком мяу для багов</b></div>' +
      '<div class="hm-love-note">certified<br><strong>COQUETTE</strong><br>coding princess ♡</div>' +
      '<div class="hm-corner hm-corner-bottom">🎀 ⋆ ˚｡⋆୨୧˚ ♡ ˚୨୧⋆｡˚ ⋆ 🎀</div>' +
      '<div class="mb-chrome">MAYBE<br>BABY<small>✧ harness ✧ est. 2026 ✧</small></div>' +
      '<div class="mb-bubble">мейби баг?<br><b>мейби фича, бейби ♡</b></div>'
    for (let i = 0; i < 48; i++) {
      const charm = document.createElement('span')
      charm.className = 'hm-ambient-charm'
      charm.textContent = ['♡', '♥', '✧', '♡', '💖', '🎀', '♡', '🐾', '💗', '💎', '♡', '⋆'][i % 12]
      if (['♡', '♥', '💖', '💗'].includes(charm.textContent)) charm.classList.add('hm-floating-heart')
      charm.style.cssText = `left:${(i*37.13)%100}%;top:${(i*23.71)%100}%;--delay:${-i*.73}s;--duration:${5+i%6}s;--size:${12+i%4*6}px`
      decor.appendChild(charm)
    }
    document.body.appendChild(decor)

    // ---- MAYBE BABY POD: pink Y2K mp3 player with original 8-bit tunes ----
    const TRACKS = [
      { name: 'maybe baby ♡ glitter mix', bpm: 128,
        lead: [76,0,79,76,81,0,79,0,76,74,72,0,74,76,0,0,76,0,79,81,84,0,81,79,76,0,74,72,74,0,0,0],
        bass: [48,48,45,45,41,41,43,43] },
      { name: 'pink_compile.exe', bpm: 140,
        lead: [72,76,79,84,79,76,72,0,74,77,81,86,81,77,74,0,72,76,79,84,88,84,79,76,77,0,74,0,72,0,0,0],
        bass: [48,48,50,50,53,53,48,43] },
      { name: 'мяу-мяу деплой (lo-fi)', bpm: 112,
        lead: [79,0,79,76,0,76,81,0,79,0,77,76,74,0,0,0,77,0,77,74,0,74,79,0,77,0,76,74,72,0,0,0],
        bass: [48,43,50,43,53,48,43,48] },
    ]
    const pod = document.createElement('div')
    pod.id = 'mb-pod'
    pod.innerHTML =
      '<div class="mb-pod-top"><span>♡ MAYBE BABY POD ♡</span><i></i></div>' +
      '<div class="mb-screen"><div class="mb-marquee"><span></span></div>' +
      '<div class="mb-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>' +
      '<div class="mb-controls">' +
      '<button class="mb-prev" aria-label="Предыдущий трек">⏮</button>' +
      '<button class="mb-play" aria-label="Играть">▶</button>' +
      '<button class="mb-next" aria-label="Следующий трек">⏭</button></div>' +
      '<div class="mb-charm" aria-hidden="true">🎀</div>'
    document.body.appendChild(pod)
    let audio, master, timer, step = 0, nextAt = 0, track = 0, playing = false
    const hz = m => 440 * Math.pow(2, (m - 69) / 12)
    const title = pod.querySelector('.mb-marquee span')
    const playBtn = pod.querySelector('.mb-play')
    function showTitle() {
      title.textContent = (playing ? '♫ now playing: ' : '♡ paused: ') + TRACKS[track].name + ' ♡ ' + (track + 1) + '/' + TRACKS.length
    }
    function tone(freq, at, dur, type, vol) {
      const osc = audio.createOscillator(), gain = audio.createGain()
      osc.type = type; osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(vol, at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      osc.connect(gain).connect(master); osc.start(at); osc.stop(at + dur + 0.03)
    }
    function schedule() {
      const t = TRACKS[track], len = 60 / t.bpm / 2
      while (nextAt < audio.currentTime + 0.15) {
        const lead = t.lead[step % t.lead.length]
        if (lead) tone(hz(lead), nextAt, len * 0.85, 'square', 0.045)
        if (step % 2 === 0) tone(hz(t.bass[Math.floor(step / 2) % t.bass.length]), nextAt, len * 1.7, 'triangle', 0.09)
        if (step % 4 === 2) tone(2400, nextAt, 0.03, 'square', 0.012) // tiny sparkle hi-hat
        step++; nextAt += len
      }
    }
    function play() {
      if (!audio) { audio = new AudioContext(); master = audio.createGain(); master.gain.value = 0.55; master.connect(audio.destination) }
      audio.resume(); playing = true; step = 0; nextAt = audio.currentTime + 0.05
      clearInterval(timer); timer = setInterval(schedule, 40); schedule()
      pod.classList.add('is-playing'); playBtn.textContent = '⏸'; playBtn.setAttribute('aria-label', 'Пауза'); showTitle()
      const r = playBtn.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top, 16)
    }
    function pause() {
      playing = false; clearInterval(timer)
      pod.classList.remove('is-playing'); playBtn.textContent = '▶'; playBtn.setAttribute('aria-label', 'Играть'); showTitle()
    }
    function skip(dir) {
      track = (track + dir + TRACKS.length) % TRACKS.length
      if (playing) play(); else showTitle()
    }
    playBtn.onclick = () => (playing ? pause() : play())
    pod.querySelector('.mb-prev').onclick = () => skip(-1)
    pod.querySelector('.mb-next').onclick = () => skip(1)
    showTitle()

    function syncEffects() {
      document.documentElement.classList.toggle('hm-effects-off', localStorage.getItem('hannah.sparkles') === 'off')
    }
    syncEffects()
    const layer = document.createElement('div')
    layer.id = 'hm-sparkles'; layer.setAttribute('aria-hidden', 'true')
    document.body.appendChild(layer)
    let last = 0
    function sparkle(x, y, count) {
      if (reduced.matches || localStorage.getItem('hannah.sparkles') === 'off') return
      for (let i = 0; i < count && layer.children.length < 85; i++) {
        const star = document.createElement('span')
        star.textContent = ['✦', '♡', '✧', '⋆', '🎀', '🐾', '💖', '💎'][Math.floor(Math.random() * 8)]
        star.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.random()*190-95}px;--dy:${-25-Math.random()*140}px;color:${['#ff32ac','#be52ff','#d6a02b'][i%3]};font-size:${14+Math.random()*15}px`
        layer.appendChild(star); setTimeout(() => star.remove(), 1000)
      }
    }
    document.addEventListener('pointermove', e => { if (Date.now()-last > 65) { sparkle(e.clientX, e.clientY, 3); last = Date.now() } })
    document.addEventListener('click', e => sparkle(e.clientX, e.clientY, 22))
    function decorate() {
      document.title = 'МЕЙБИ БЕЙБИ ХАРНЕСС ♡'
      const top = document.querySelector('.cx-top')
      if (top && !top.querySelector('.hm-brand')) {
        const brand = document.createElement('div'); brand.className = 'hm-brand'
        brand.innerHTML = '<span class="hm-star">🎀</span><div><b>МЕЙБИ<span>БЕЙБИ</span></b><small>♡ ХАРНЕСС · KITTY GLITTER OS ♡</small></div>'
        top.prepend(brand)
      }
      const nav = document.querySelector('.cx-nav')
      if (nav && !document.querySelector('.hm-kitty-club')) {
        const club = document.createElement('div'); club.className = 'hm-kitty-club'
        club.innerHTML = '<div>' + kitty('#fff4fb', '#f26cb7') + '<span>meow.exe<br><b>слишком гламурно,<br>чтобы падать</b></span></div><small>🐾 cat mom · bug slayer · pink enjoyer 🎀</small>'
        nav.after(club)
      }
      const newButton = document.querySelector('.cx-new span')
      if (newButton) newButton.textContent = 'Новый хит 🎀 мяу!'
      const search = document.querySelector('.cx-search input')
      if (search) search.placeholder = '🐾 Нюх-нюх… ищем хит'
      const section = document.querySelector('.cx-section > span')
      if (section) section.textContent = '♡ ШКАТУЛКА ПРОЕКТИКОВ'
      const hero = document.querySelector('.cx-hero')
      if (hero && !hero.classList.contains('hm-ready')) {
        hero.classList.add('hm-ready')
        hero.innerHTML = '<div class="hm-eyebrow">🎀 BEST OF BOTH WORLDS · WORST OF ALL BUGS 🎀</div><div class="hm-kitty-parade" aria-hidden="true"><span>✧</span>' + kitty('#eed5ff', '#ba76e4') + kitty('#fff4fb', '#f26cb7') + kitty('#ffe5c8', '#e777c5') + '<span>✧</span></div><h1>Code like a <em>superstar.</em> 💅</h1><p>Компилирую на блёстках. Дебажу лапками. Деплою с бантиком.</p><div class="hm-stickers"><span>🐾 meow-driven development</span><span>💖 emotionally attached to pink</span><span>💎 99% glitter, 1% code</span></div><div class="hm-princess-status">୨୧ princess mode: <b>ABSOLUTELY UNHINGED</b> ୨୧</div>'
      }
      const pop = document.querySelector('.cx-pop')
      if (pop && !pop.querySelector('.hm-glam')) {
        const light = pop.querySelector('[data-v="light"]'); if (light) light.textContent = 'Принцесса'
        const dark = pop.querySelector('[data-v="dark"]'); if (dark) dark.textContent = 'Суперзвезда'
        const button = document.createElement('button'); button.className = 'hm-glam'
        const label = () => button.textContent = '💎 Глиттер-апокалипсис: ' + (localStorage.getItem('hannah.sparkles') === 'off' ? 'выкл' : 'ВКЛ')
        label(); button.onclick = () => { localStorage.setItem('hannah.sparkles', localStorage.getItem('hannah.sparkles') === 'off' ? 'on' : 'off'); syncEffects(); label() }
        pop.appendChild(button)
      }
    }
    decorate(); setInterval(decorate, 600)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
