(function () {
  var btn = document.getElementById("menu-btn"),
    links = document.getElementById("nav-links");
  btn.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menu");
    }
  });

  // Typewriter for the hero details
  if (!document.documentElement.classList.contains("intro")) return;
  var els = [].slice.call(document.querySelectorAll("[data-type]"));
  var caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  var queue = [];
  els.forEach(function (el) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var chars = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.textContent = text[i];
      el.appendChild(s);
      chars.push(s);
    }
    el.style.visibility = "visible";
    queue.push({ el: el, chars: chars });
  });
  var speed = 28,
    pause = 160;
  function typeItem(k) {
    if (k >= queue.length) {
      setTimeout(function () {
        caret.remove();
      }, 1400);
      return;
    }
    var item = queue[k],
      j = 0;
    item.el.insertBefore(caret, item.chars[0] || null);
    (function step() {
      if (j < item.chars.length) {
        item.chars[j].classList.add("on");
        item.el.insertBefore(caret, item.chars[j].nextSibling);
        j++;
        setTimeout(step, speed);
      } else {
        setTimeout(function () {
          typeItem(k + 1);
        }, pause);
      }
    })();
  }
  setTimeout(function () {
    typeItem(0);
  }, 1000);
})();

// Walking dachshund: steps follow the distance walked, so the paws never slide
(function () {
  var track = document.querySelector(".dog-track");
  if (!track) return;
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) {}
  var runner = track.querySelector(".dog-runner"),
    dog = track.querySelector(".dog"),
    tail = track.querySelector(".dog-tail"),
    legs = [].slice.call(track.querySelectorAll(".dog-leg")).map(function (el) {
      return {
        el: el,
        sign: el.classList.contains("alt") ? -1 : 1,
        front: +el.querySelector("rect").getAttribute("x") > 0,
      };
    });
  var DOG_W = 63,
    SPEED = 34, // px/s on average
    STRIDE = 22, // px per full step cycle
    TURN = 480, // ms
    JUMP = 560, // ms
    JUMP_H = 11; // px
  var mode = "wait",
    clock = 0,
    t0 = 0,
    wait = 700,
    from = 0,
    to = 0,
    dur = 1,
    x = 0,
    dir = 1,
    face = 1,
    phase = 0,
    legAmp = 0,
    wag = 0,
    tailAmp = 16,
    tailRate = 3,
    jumpAt = -1,
    nextJump = 2500,
    last = 0,
    raf = 0;

  function ease(u) {
    return 0.5 - 0.5 * Math.cos(Math.PI * u);
  }
  function approach(v, target, dt, rate) {
    return v + (target - v) * Math.min(1, dt * rate);
  }
  function startWalk() {
    from = x;
    to = dir > 0 ? Math.max(0, track.clientWidth - DOG_W) : 0;
    dur = Math.max(1, (Math.abs(to - from) / SPEED) * 1000);
    mode = "walk";
    t0 = clock;
  }

  function jump() {
    if (jumpAt < 0 && mode !== "turn") jumpAt = clock;
  }

  function frame(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0,
      hop = 0,
      walking = false;
    last = now;
    clock += dt * 1000;

    if (mode === "wait") {
      if (clock - t0 > wait) startWalk();
    } else if (mode === "walk") {
      var u = Math.min((clock - t0) / dur, 1),
        nx = from + (to - from) * ease(u);
      phase += (Math.abs(nx - x) / STRIDE) * 2 * Math.PI;
      x = nx;
      walking = u < 1;
      // Now and then, a little hop mid-walk
      if (u > 0.2 && u < 0.8 && clock > nextJump) {
        jump();
        nextJump = clock + 4000 + Math.random() * 6000;
      }
      if (u >= 1) {
        mode = "rest";
        t0 = clock;
        wait = 1000 + Math.random() * 1600;
      }
    } else if (mode === "rest") {
      if (clock - t0 > wait) {
        mode = "turn";
        t0 = clock;
      }
    } else if (mode === "turn") {
      var v = Math.min((clock - t0) / TURN, 1);
      face = dir * Math.cos(Math.PI * ease(v));
      hop = Math.sin(Math.PI * v) * 2.5;
      if (v >= 1) {
        dir = -dir;
        face = dir;
        startWalk();
      }
    }

    var air = 0,
      tilt = 0;
    if (jumpAt >= 0) {
      var j = (clock - jumpAt) / JUMP;
      if (j >= 1) {
        jumpAt = -1;
      } else {
        hop += 4 * j * (1 - j) * JUMP_H;
        air = Math.sin(Math.PI * j);
        tilt = -9 * Math.cos(Math.PI * j) * air;
      }
    }

    // Legs settle when standing; the tail wags happier while resting
    legAmp = approach(legAmp, walking ? 1 : 0, dt, 8);
    tailAmp = approach(tailAmp, walking ? 16 : 22, dt, 4);
    tailRate = approach(tailRate, walking ? 3 : 4.6, dt, 4);
    wag += dt * tailRate * 2 * Math.PI;

    var s = Math.sin(phase),
      y = -Math.abs(s) * 0.9 * legAmp - hop;
    runner.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
    dog.style.transform =
      "scaleX(" + face.toFixed(3) + ") rotate(" + tilt.toFixed(2) + "deg)";
    tail.style.transform = "rotate(" + (2 + tailAmp * Math.sin(wag)).toFixed(2) + "deg)";
    legs.forEach(function (l) {
      // In the air the legs stretch out: front forward, back backward
      var a = 22 * legAmp * s * l.sign * (1 - air) + (l.front ? -38 : 38) * air;
      l.el.style.transform = "rotate(" + a.toFixed(2) + "deg)";
    });

    raf = requestAnimationFrame(frame);
  }

  runner.classList.add("live");
  runner.addEventListener("click", jump);

  function play() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? play() : stop();
    }).observe(track);
  } else {
    play();
  }
})();
