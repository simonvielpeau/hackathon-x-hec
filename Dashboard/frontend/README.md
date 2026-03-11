# Executive Dashboard — Frontend React

Interface moderne pour l'audit CX, avec design dark mode et visualisations interactives.

## Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS v4**
- **Recharts** (Treemap, BarChart)

## Lancer en développement

```bash
cd frontend
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

## Build production

```bash
npm run build
npm run preview
```

## Données

Le fichier `data.json` est lié par symlink depuis la racine du projet. Les données sont partagées avec le dashboard Streamlit.
