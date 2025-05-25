window.addEventListener("load", () => {
  // Scroll to top on load
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);

  // Get elements
  const component = document.querySelector(".orbit_carousel");
  const wrap = component.querySelector(".orbit_wrap");
  const items = wrap.querySelectorAll(".orbit_item");
  const panels = component.querySelectorAll(".orbit_text_item");
  const nextBtn = component.querySelector(".orbit_arrow.is-next");
  const prevBtn = component.querySelector(".orbit_arrow.is-prev");

  // Carousel geometry setup
  const angle = 360 / items.length;
  const z = 2 * Math.tan((angle / 2) * (Math.PI / 180));
  const depthNeg = `calc(var(--item-width) / -${z} - var(--gap))`;
  const depthPos = `calc(var(--item-width) / ${z} + var(--gap))`;

  wrap.style.setProperty("--z-depth", depthNeg);
  wrap.style.perspective = depthPos;
  wrap.style.setProperty("--camera-x", "60deg"); // initial camera angle

  // Animate carousel appearance
  gsap.to(wrap, { opacity: 1, duration: 0.5 });

  // Animate items into orbit
  items.forEach((item, i) => {
    const delay = i * 0.1;
    gsap.set(item, {
      opacity: 0,
      transform: "rotateY(0deg) translateZ(0px)",
    });
    gsap.to(item, {
      delay,
      opacity: 1,
      transform: `rotateY(${angle * i}deg) translateZ(${depthPos})`,
      duration: 0.8,
      ease: "power3.out",
    });
  });

  // Camera transition from top to default
  gsap.to(wrap, {
    delay: items.length * 0.1 + 0.3,
    duration: 1.2,
    ease: "power2.out",
    onUpdate: function () {
      const progress = this.progress();
      const camX = 60 - 60 * progress;
      wrap.style.setProperty("--camera-x", `${camX}deg`);
    },
  });

  // Carousel auto-rotation on scroll
  gsap
    .timeline({
      scrollTrigger: {
        trigger: component,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    })
    .fromTo(
      wrap,
      { "--rotate": "0deg" },
      { "--rotate": `-${360 - angle}deg`, duration: 30, ease: "none" }
    );

  // ScrollTrigger for text panels (fade in/out)
  panels.forEach((panel) => {
    gsap.set(panel, { opacity: 0, y: 50 });
    ScrollTrigger.create({
      trigger: panel,
      start: "top 70%",
      end: "bottom top",
      onEnter: () => gsap.to(panel, { opacity: 1, y: 0, duration: 0.8 }),
      onLeave: () => gsap.to(panel, { opacity: 0, y: -30, duration: 0.5 }),
      onEnterBack: () => gsap.to(panel, { opacity: 1, y: 0, duration: 0.8 }),
      onLeaveBack: () => gsap.to(panel, { opacity: 0, y: 50, duration: 0.5 }),
    });
  });

  // Text panel nav sync
  let activePanel = panels[0];
  let animating = false;

  const setActive = (panel) => {
    activePanel = panel;
    nextBtn.classList.toggle("is-inactive", !panel.nextElementSibling);
    prevBtn.classList.toggle("is-inactive", !panel.previousElementSibling);
  };

  const scrollToPanel = () => {
    if (!animating) {
      animating = true;
      window.scrollTo({
        top: activePanel.offsetTop,
        behavior: "smooth",
      });
      setTimeout(() => (animating = false), 600);
    }
  };

  panels.forEach((panel) => {
    ScrollTrigger.create({
      trigger: panel,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) setActive(panel);
      },
    });
  });

  nextBtn.addEventListener("click", () => {
    if (activePanel.nextElementSibling && !animating) {
      setActive(activePanel.nextElementSibling);
      scrollToPanel();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (activePanel.previousElementSibling && !animating) {
      setActive(activePanel.previousElementSibling);
      scrollToPanel();
    }
  });
});
