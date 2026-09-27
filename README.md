# Plantilla de web de demostración para negocios locales

Generador estático sin dependencias (solo Node). Demo actual: **Martín Urquiza** (Encuadernaciones Martín Urquiza) (Granada).

## Uso

```bash
node build.mjs                      # genera dist/ con data/business.json
node build.mjs data/otro-negocio.json   # variante para otro negocio
python3 -m http.server 4173 -d dist     # previsualizar
netlify deploy --dir=dist --prod        # publicar
```

## Estructura

- `data/business.json`: nombre, dirección, teléfono, horario, eslóganes y paleta (`theme`). Es lo único que cambia entre negocios del mismo sector.
- `src/partials/`: layout, cabecera (incluye el aviso «Propuesta de demostración no oficial») y pie.
- `src/pages/`: inicio, servicios y contacto (contenido específico del sector; editar textos aquí).
- `src/assets/`: `styles.css` (colores desde `theme`), `main.js` (animaciones, configurador, pestañas, formularios simulados).

## Para una variante de otro sector

1. Copia `data/business.json` y cambia datos y paleta.
2. Reescribe los textos de `src/pages/*.html` (los marcadores `{{clave.subclave}}` toman valores del JSON).
3. Sustituye la ilustración del libro 3D (`.book`) por otra pieza visual si no aplica.

Los formularios son simulados (no envían nada) y la web lleva `noindex`.
