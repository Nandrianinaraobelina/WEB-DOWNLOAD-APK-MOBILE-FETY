# FetyApp — Page de téléchargement

Simple page web statique permettant à tout le monde de télécharger l'application mobile **FetyApp** (APK Android).

## Contenu

- `index.html` — structure de la page (HTML uniquement)
- `css/style.css` — toutes les feuilles de style et animations CSS
- `js/main.js` — toutes les animations et interactions JavaScript
- `assets/logo.png` — logo de l'application
- `assets/favicon.png` — favicon

## Lien de téléchargement

Le bouton de téléchargement pointe vers l'APK hébergé sur la release GitHub :

```
https://github.com/Nandrianinaraobelina/fetyapp-release/releases/download/v2.1.2/fetyApp.apk
```

> **Important :** pour mettre à jour le lien après une nouvelle release, remplacez
> `v2.1.2` et `fetyApp.apk` par le tag et le nom du fichier de la nouvelle release
> dans `index.html` (2 occurrences : héro et section CTA finale).

## Tester en local

```bash
# Depuis le dossier du projet
cd fetyapp-download
python -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Déployer gratuitement

### GitHub Pages

1. Créez un dépôt GitHub (ex. `fetyapp-download`).
2. Poussez le contenu de ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Page de téléchargement FetyApp"
   git branch -M main
   git remote add origin https://github.com/VOTRE_COMPTE/fetyapp-download.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Branch : `main` → `/ (root)` → Save**.
4. Votre page est en ligne sur `https://VOTRE_COMPTE.github.io/fetyapp-download/`.

### Netlify / Vercel

- **Netlify :** glissez-déposez le dossier `fetyapp-download` sur https://app.netlify.com/drop.
- **Vercel :** importez le projet (aucune configuration nécessaire, site statique).

## Remarques

- L'APK (~81 MB) est hébergé sur GitHub Releases, il n'est donc **pas** copié dans
  ce dossier pour éviter de dupliquer le fichier. La page fonctionne partout tant
  que le lien de la release est public.
- Si vous préférez héberger l'APK avec la page, copiez `fetyApp.apk` dans ce dossier
  et remplacez les liens GitHub par `fetyApp.apk`.
