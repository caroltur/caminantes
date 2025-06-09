import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are not available, return a mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found. Using mock client.")
    return {
      from: () => ({
        select: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Mock client") }) }),
          limit: () => Promise.resolve({ data: [], error: new Error("Mock client") }),
          order: () => Promise.resolve({ data: [], error: new Error("Mock client") }),
        }),
        insert: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
        update: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
        upsert: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ error: new Error("Mock client") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
