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
  var speed = 45,
    pause = 320;
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
  }, 3900);
})();
