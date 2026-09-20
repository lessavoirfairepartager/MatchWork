/* MatchWork — configuration Supabase
   Remplace les deux valeurs ci-dessous par celles de ton projet :
   Supabase > Project Settings > API > Project URL et anon public key.
   La clé « anon » est publique par conception : elle ne donne accès
   qu'à ce que les politiques RLS autorisent. Ne mets JAMAIS ici la
   clé « service_role ». */
window.MW_CONFIG = {
  url: "https://VOTRE-PROJET.supabase.co",
  key: "VOTRE_CLE_ANON_PUBLIQUE"
};
