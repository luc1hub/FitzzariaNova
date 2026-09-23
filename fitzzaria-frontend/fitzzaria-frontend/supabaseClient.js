// Substitua o conteúdo do supabaseClient.js por isto:
const SUPABASE_URL = 'https://vupacqwmayhmfqdqpxge.supabase.co'; // Substitua se a URL for diferente
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI'; // Coloque a sua chave pública do Supabase

// Cria o cliente global do Supabase no navegador
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);