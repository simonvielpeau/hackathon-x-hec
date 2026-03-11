# Dashboard Executive — Audit CX

## Streamlit

```bash
cd dashboard
pip install -r requirements.txt
streamlit run dashboard.py
```

## React (frontend)

```bash
cd dashboard/frontend
npm install
npm run dev
```

## Structure

- `dashboard.py` — Application Streamlit principale
- `data_loader.py` — Chargement et aplatissement des données
- `frontend/` — Interface React
- `requirements.txt` — Dépendances Python

Les données `data.json` sont à la racine du projet.
