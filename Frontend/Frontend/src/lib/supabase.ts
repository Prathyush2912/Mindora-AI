import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

supabase
  .from("profiles")
  .select("id")
  .limit(1)
  .then(({ error }) => {
    console.log(
      error ? "Supabase error: " + error.message : "Supabase connected!"
    );
  });