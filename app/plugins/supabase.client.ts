import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yzuyoeqvfzwzzbdgnnce.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dXlvZXF2Znp3enpiZGdubmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjY0NTYsImV4cCI6MjA3ODYwMjQ1Nn0.uY2OtfCbacXkXOtUL_jdLZN2Y4dwxunuANW9Kydivyo'

export default defineNuxtPlugin(() => {
  const supabase = createClient(supabaseUrl, supabaseKey)
  return {
    provide: {
      supabase
    }
  }
})
