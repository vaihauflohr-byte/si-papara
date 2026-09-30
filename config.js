// =====================================================================
//  Configuration du site — seul fichier à modifier après l'installation.
//  Laisse les deux champs Supabase vides : le site tourne en MODE DÉMO
//  (données stockées dans ce navigateur uniquement, pour tester).
// =====================================================================
window.SIP_CONFIG = {
  supabaseUrl: "https://zhxbjarkimttlmfvvcyb.supabase.co/rest/v1/",       // ex. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "sb_publishable_5z3o1duIU-0bJpGTyiLyaw_vZsXXF7U",   // Supabase > Project Settings > API Keys > clé "publishable" (sb_publishable_…) ou "anon public"
  etablissement: "LPO Papara",
  dureeCycleJours: 60,   // durée de lecture quotidienne d'une fiche avant qu'elle soit « ancrée »
  questionsRevisionHebdo: 10
};
