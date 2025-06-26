/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Puedes añadir otras configuraciones aquí si las tienes
};

module.exports = nextConfig; // Exporta el objeto de configuración unificado