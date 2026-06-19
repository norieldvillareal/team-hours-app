import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://flvxsfhkuqmbjzlfpckb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdnhzZmhrdXFtYmp6bGZwY2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MzgyOTQsImV4cCI6MjA5NzQxNDI5NH0.77lWikbYehouHw36mKCzGuDuaTro9kFjIjGMMnYWTh8"
)
