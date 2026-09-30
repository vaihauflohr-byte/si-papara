// =====================================================================
//  Configuration du site — seul fichier à modifier après l'installation.
//  Laisse les deux champs Supabase vides : le site tourne en MODE DÉMO
//  (données stockées dans ce navigateur uniquement, pour tester).
// =====================================================================
window.SIP_CONFIG = {
  supabaseUrl: "",       // ex. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "",   // Supabase > Project Settings > API Keys > clé "publishable" (sb_publishable_…) ou "anon public"
  etablissement: "LPO Papara",
  dureeCycleJours: 60,   // durée de lecture quotidienne d'une fiche avant qu'elle soit « ancrée »
  questionsRevisionHebdo: 10
};
