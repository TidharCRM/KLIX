const cards = Array.from(document.querySelectorAll(".tcard"));
const deck = document.getElementById("deck");
const dotsWrap = document.getElementById("dots");
const next = document.getElementById("next");
const prev = document.getElementById("prev");

let idx = 0;
let autoplay;

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = `dot${i === idx ? " active" : ""}`;
    dot.type = "button";
    dot.setAttribute("aria-label", `מעבר להמלצה ${i + 1}`);
    dot.addEventListener("click", () => {
      setIndex(i);
      restartAutoplay();
    });
    dotsWrap.appendChild(dot);
  });
}

function setIndex(nextIndex) {
  if (!cards.length) return;
  idx = (nextIndex + cards.length) % cards.length;
  cards.forEach((card, i) => {
    card.classList.toggle("active", i === idx);
  });
  renderDots();
}

function restartAutoplay() {
  clearInterval(autoplay);
  autoplay = setInterval(() => setIndex(idx + 1), 6000);
}

next?.addEventListener("click", () => {
  setIndex(idx + 1);
  restartAutoplay();
});
prev?.addEventListener("click", () => {
  setIndex(idx - 1);
  restartAutoplay();
});

let touchStartX = 0;
let touchStartY = 0;

deck?.addEventListener(
  "touchstart",
  (ev) => {
    const t = ev.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  },
  { passive: true }
);

deck?.addEventListener(
  "touchend",
  (ev) => {
    const t = ev.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      setIndex(dx < 0 ? idx + 1 : idx - 1);
      restartAutoplay();
    }
  },
  { passive: true }
);

if (cards.length) {
  setIndex(0);
  restartAutoplay();
}

const revealEls = document.querySelectorAll("[data-reveal]");
revealEls.forEach((el) => {
  const delay = parseInt(el.dataset.delay || "0", 10);
  el.style.setProperty("--reveal-delay", delay);
});

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

const menuBtn = document.getElementById("menuBtn");
const menuOverlay = document.getElementById("menuOverlay");

function closeMenu() {
  if (!menuBtn || !menuOverlay) return;
  menuBtn.setAttribute("aria-expanded", "false");
  menuOverlay.classList.remove("is-open");
  menuOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openMenu() {
  if (!menuBtn || !menuOverlay) return;
  menuBtn.setAttribute("aria-expanded", "true");
  menuOverlay.classList.add("is-open");
  menuOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

menuBtn?.addEventListener("click", () => {
  const isOpen = menuOverlay?.classList.contains("is-open");
  if (isOpen) closeMenu();
  else openMenu();
});

menuOverlay?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
