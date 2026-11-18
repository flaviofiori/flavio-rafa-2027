// Runs in <head> so the intro class is set before first paint
try {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
    document.documentElement.classList.add("intro");
} catch (e) {}
