# MatchWork

Matching emploi anonymisé façon swipe. Les profils mettent en avant savoirs, savoir-faire et savoir-être ; nom, âge et coordonnées restent hors de portée jusqu'au match.

Front statique (HTML/CSS/JS sans framework) + Supabase (Postgres, authentification, règles d'accès par ligne). Déploiement sur Netlify.

## Fichiers

- `index.html` — l'application
- `style.css` — la feuille de style commune
- `config.js` — l'URL et la clé publique Supabase (à renseigner)
- `mentions-legales.html`, `confidentialite.html` — pages légales (champs entre crochets à compléter)
- `supabase/schema.sql` — tout le schéma, les règles d'accès et les fonctions

## Mise en service

1. Créer un projet sur supabase.com. **Choisir une région dans l'Union européenne** (Francfort ou Paris) : c'est ce qui permet d'annoncer un hébergement européen dans la politique de confidentialité.
2. Dans l'éditeur SQL du projet, coller l'intégralité de `supabase/schema.sql` et exécuter. Une seule fois.
3. Dans Authentication > Providers, garder « Email » activé. Pour tester rapidement, on peut désactiver la confirmation par e-mail (Authentication > Sign In / Providers > Confirm email) ; à réactiver avant d'ouvrir à de vraies personnes.
4. Dans Project Settings > API, copier « Project URL » et la clé « anon public » dans `config.js`. Cette clé est publique par conception : seules les règles RLS décident de ce qui est lisible. Ne jamais mettre la clé `service_role` dans le dépôt.
5. Dans Authentication > URL Configuration, mettre l'adresse du site (par exemple `https://matchw0rkapp.netlify.app`) comme Site URL.
6. Compléter les crochets dans les deux pages légales.
7. Pousser sur GitHub. Netlify redéploie tout seul.

## Points de vigilance

- **Mise en veille.** Un projet Supabase gratuit est mis en pause après une semaine sans activité et doit être relancé à la main depuis le tableau de bord. Acceptable pour un pilote, pas pour un service ouvert en continu.
- **Un compte, une offre.** Côté employeur, l'application gère une seule offre par compte. Pour plusieurs postes, il faudra faire évoluer l'écran de profil (la base, elle, accepte déjà plusieurs offres par propriétaire).
- **Purge.** La fonction `purge_inactive(12)` supprime les comptes sans connexion depuis douze mois, comme annoncé dans la politique de confidentialité. À exécuter manuellement de temps en temps, ou à planifier avec pg_cron.
- **Modération.** Aucun outil intégré. À l'échelle d'un pilote, la surveillance se fait à la main depuis la console Supabase.
- **Amorçage.** Une plateforme de mise en relation ne vaut rien tant que les deux côtés ne sont pas présents en même temps. Viser un seul bassin d'emploi et une fenêtre de quelques semaines annoncée comme une session.

## Vérifier que l'anonymat tient vraiment

Test à faire avant d'ouvrir : créer deux comptes candidats, se connecter avec le premier, ouvrir la console du navigateur et tenter

```js
await window.supabase.createClient(MW_CONFIG.url, MW_CONFIG.key).from('cand_private').select('*')
```

La requête ne doit retourner que sa propre ligne. Si elle en retourne d'autres, les règles RLS n'ont pas été appliquées : reprendre l'étape 2.
