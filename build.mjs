// Generador estático sin dependencias. Uso: node build.mjs [ruta/business.json]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = process.argv[2] || join(root, "data/business.json");
const data = JSON.parse(readFileSync(dataFile, "utf8"));
const dist = join(root, "dist");

const enc = encodeURIComponent;
data.fullAddress = `${data.address.street}, ${data.address.postalCode} ${data.address.city}`;
data.mapEmbed = `https://www.google.com/maps?q=${enc(data.mapQuery)}&output=embed`;
data.mapLink = `https://www.google.com/maps/search/?api=1&query=${enc(data.mapQuery)}`;
data.year = new Date().getFullYear();
data.deployDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), data);
const partial = (n) => readFileSync(join(root, "src/partials", n + ".html"), "utf8");

function render(tpl, ctx = {}) {
  let out = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partial(n));
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
    if (k in ctx) return ctx[k];
    const v = get(k);
    if (v === undefined) throw new Error(`Falta el dato: ${k}`);
    return v;
  });
  return out;
}

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(join(dist, "assets"), { recursive: true });

const pages = {
  index: { title: `${data.name} · ${data.category} en ${data.address.city}`, desc: `${data.tagline} Impresión y encuadernación de tesis doctorales, TFM y TFG, e impresión 3D, en ${data.address.city}. Envío gratis y diseño de portada incluido.` },
  servicios: { title: `Servicios · ${data.name}`, desc: `Tapa dura, tapa blanda, laminados y papeles para tu tesis, e impresión 3D. Revisión de archivos y diseño de portada gratis.` },
  contacto: { title: `Contacto y cita previa · ${data.name}`, desc: `Solicita presupuesto o cita previa en ${data.fullAddress}. Teléfono ${data.phone}.` },
};

for (const [page, meta] of Object.entries(pages)) {
  const body = render(readFileSync(join(root, "src/pages", page + ".html"), "utf8"), { page });
  const html = render(partial("layout"), { page, pageTitle: meta.title, pageDesc: meta.desc, content: body });
  writeFileSync(join(dist, page + ".html"), render(html, { page }));
}

for (const f of readdirSync(join(root, "src/assets"))) {
  const src = readFileSync(join(root, "src/assets", f), "utf8");
  writeFileSync(join(dist, "assets", f), /\.(css|svg)$/.test(f) ? render(src) : src);
}
writeFileSync(join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log("Build OK →", dist);
