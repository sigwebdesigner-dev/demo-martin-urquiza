(() => {
  const d = document;
  d.documentElement.classList.add("js");
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => [...r.querySelectorAll(s)];

  // Navegación activa + menú móvil
  const page = d.body.dataset.page;
  $$("[data-nav]").forEach((a) => a.dataset.nav === page && a.setAttribute("aria-current", "page"));
  const toggle = $(".nav-toggle"), nav = $("#nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  nav?.addEventListener("click", (e) => e.target.closest("a") && (nav.classList.remove("open"), toggle.setAttribute("aria-expanded", "false")));

  const fab = $(".fab-call");
  const onScroll = () => fab?.classList.toggle("show", scrollY > 500);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Revelado al hacer scroll
  const items = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add("in"));

  // Inclinación del libro 3D con ratón/dedo
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    $$("[data-tilt]").forEach((st) => {
      const book = $(".book", st);
      const move = (e) => {
        const r = st.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        st.classList.add("tilting");
        book.style.setProperty("--ry", `${-28 + x * 40}deg`);
        book.style.setProperty("--rx", `${6 - y * 24}deg`);
      };
      const leave = () => { st.classList.remove("tilting"); book.style.removeProperty("--ry"); book.style.removeProperty("--rx"); };
      st.addEventListener("pointermove", move);
      st.addEventListener("pointerleave", leave);
      st.addEventListener("pointercancel", leave);
    });
  }

  // Configurador
  const info = {
    tapa: {
      dura: "Tapa dura: cartón rígido de 2,75 mm forrado con papel de 170 g laminado. Cola y costura; hemos encuadernado volúmenes de 1700 páginas en papel de 90 g.",
      blanda: "Tapa blanda: portada en cartulina de 350 g, rústica fresada con cola caliente y costura. Lomo de hasta 4,5 cm (unas 1000 páginas según el papel).",
    },
    laminado: {
      mate: "Laminado mate 25 µ anti-rayas: la opción recomendada.",
      brillo: "Laminado brillo 23 µ: una fina capa que protege y da un acabado luminoso.",
    },
    papel: {
      offset: "Papel offset alta blancura de 100 g: no transparenta y mantiene una encuadernación fuerte.",
      estucado: "Papel estucado mate de 130 g: no transparenta y mantiene una encuadernación fuerte.",
      roto: "Papel blanco roto de 90 g: no transparenta y mantiene una encuadernación fuerte.",
    },
  };
  const label = { dura: "Tapa dura", blanda: "Tapa blanda", mate: "Laminado mate", brillo: "Laminado brillo" };
  const conf = $("#configurador");
  if (conf) {
    const book = $("#confBook");
    const update = () => {
      const v = Object.fromEntries($$("input:checked", conf).map((i) => [i.name, i.value]));
      book.dataset.bind = v.tapa; book.dataset.lam = v.laminado; book.dataset.papel = v.papel;
      $("#sumTitle").textContent = `${label[v.tapa]} · ${label[v.laminado]}`;
      $("#sumTapa").textContent = info.tapa[v.tapa];
      $("#sumLam").textContent = info.laminado[v.laminado];
      $("#sumPapel").textContent = info.papel[v.papel];
      $("#sumCta").href = `contacto.html?tapa=${v.tapa}&laminado=${v.laminado}&papel=${v.papel}#presupuesto`;
    };
    conf.addEventListener("change", update);
    update();
  }

  // Pestañas accesibles
  $$("[data-tabs]").forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const show = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute("aria-selected", on);
        x.tabIndex = on ? 0 : -1;
        d.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
      focus && t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t));
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); show(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    const hash = location.hash.replace("#", "");
    const t = tabs.find((x) => x.getAttribute("aria-controls") === hash);
    t && show(t);
  });

  // Rellenar presupuesto desde la URL
  const qs = new URLSearchParams(location.search);
  ["trabajo", "tapa", "laminado", "papel"].forEach((k) => {
    const el = $(`#presupuesto select[name="${k}"]`);
    if (el && qs.get(k) && [...el.options].some((o) => o.value === qs.get(k))) el.value = qs.get(k);
  });

  // Formularios simulados: no se envía nada
  $$("[data-demo-form]").forEach((form) => {
    const msg = $(".form-msg", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach((f) => {
        const bad = f.type === "checkbox" ? !f.checked : !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      msg.hidden = false;
      msg.classList.toggle("error", !ok);
      msg.textContent = ok
        ? "Gracias. Esto es una demostración: tu solicitud no se ha enviado a ningún sitio."
        : "Revisa los campos marcados y acepta la política de privacidad.";
      if (ok) form.reset();
    });
  });
})();
