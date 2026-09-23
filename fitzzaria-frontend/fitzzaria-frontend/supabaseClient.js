const SUPABASE_URL = 'https://vupacqwmayhmfqdqpxge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cGFjcXdtYXlobWZxZHFweGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODg5ODUsImV4cCI6MjEwNTc2NDk4NX0.EwUZqDaJAjQVg-E7Yglr5Gt7F7Ng7sS-w07V6mWiygE';

// Instancia o cliente global do Supabase para uso no navegador
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);