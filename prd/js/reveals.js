function initReveals(scroller = document.documentElement) {
  const OFFSET = 50;

  const typeToXY = (type) =>
    ({
      fade: { x: 0, y: 0 },
      "fade-up": { x: 0, y: OFFSET },
      "fade-down": { x: 0, y: -OFFSET },
      "fade-left": { x: OFFSET, y: 0 },
      "fade-right": { x: -OFFSET, y: 0 }
    }[type] || { x: 0, y: OFFSET });

  // (A) individual
  document.querySelectorAll('[data-reveal="true"]').forEach((el) => {
    if (el.dataset.revealInited === "1") return;
    el.dataset.revealInited = "1";

    const type = el.dataset.revealType || "fade-up";
    const delay = parseFloat(el.dataset.revealDelay) || 0;
    const { x, y } = typeToXY(type);

    gsap.set(el, { opacity: 0, x, y });

    ScrollTrigger.create({
      id: `reveal-${el.dataset.revealId || Math.random().toString(16).slice(2)}`,
      trigger: el,
      scroller,
      start: "top bottom",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          delay,
          duration: 1,
          ease: "power2.out",
          onComplete: () => {
            el.style.transform = "none";
          }
        });
      }
    });
  });

  // (B) group
  document.querySelectorAll("[data-reveal-group]").forEach((parent) => {
    if (parent.dataset.revealInited === "1") return;
    parent.dataset.revealInited = "1";

    const type = parent.dataset.revealType || "fade";
    const delay = parseFloat(parent.dataset.revealDelay) || 0;
    const stagger = parseFloat(parent.dataset.revealStagger) || 0.3;
    const start = parent.dataset.revealStart || "top 85%";
    const once = parent.dataset.revealOnce !== "false";

    const children = parent.querySelectorAll("[data-reveal-child]");
    if (!children.length) return;

    const { x, y } = typeToXY(type);
    gsap.set(children, { opacity: 0, x, y });

    ScrollTrigger.create({
      id: `reveal-${parent.dataset.revealId || Math.random().toString(16).slice(2)}`,
      trigger: parent,
      scroller,
      start,
      once,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          x: 0,
          y: 0,
          delay,
          duration: .5,
          ease: "power2.out",
          stagger,
          onComplete: () => {
            children.forEach((el) => (el.style.transform = "none"));
          }
        });
      }
    });
  });
}

/*

data-reveal
true

data-reveal-type
fade

data-reveal-delay
0.3


---

data-reveal-group
true

data-reveal-type
fade

data-reveal-stagger
.3

data-reveal-child

*/