// Supabase Client Module
// Uses global supabase object loaded via CDN script

const SUPABASE_URL = "https://rjyutkewkohrttxklwil.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqeXV0a2V3a29ocnR0eGtsd2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDcyODYsImV4cCI6MjA4ODEyMzI4Nn0.cYeKYo2n1JqNw6h9cV6oVt5hHE1QSY1qd3xjHEJBqYI";

// Create Supabase client using global supabase object
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it globally available
window.supabaseClient = supabaseClient;