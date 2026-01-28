/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
