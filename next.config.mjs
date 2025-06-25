import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Отключить PWA в разработке
  register: true, // Автоматически регистрировать Service Worker
  skipWaiting: true, // Пропускать ожидание для активации нового Service Worker
  // Опционально: настройка кэширования
  runtimeCaching: [
    {
      urlPattern: /^https?.*/, // Кэшировать все HTTP/HTTPS запросы
      handler: 'NetworkFirst', // Сначала сеть, затем кэш
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
};

const configuredWithPWA = withPWA(pwaConfig);

const nextConfig = {
  reactStrictMode: false,
  // experimental: {
  //   esmExternals: 'loose',
  // },
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    'rc-util',
    'rc-textarea',
    'rc-tooltip',
    'rc-tabs',
    'rc-resize-observer',
    'rc-pagination',
    '@rc-component/util',
    'rc-picker',
    'rc-input',
    '@ant-design',
    '@ant-design/cssinjs-utils',
    '@babel/runtime',
  ],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });

    config.resolve.alias['@babel/runtime/helpers'] = path.resolve(
      __dirname,
      'node_modules/@babel/runtime/helpers',
    );
    config.resolve.alias['@babel/runtime/helpers/esm'] = path.resolve(
      __dirname,
      'node_modules/@babel/runtime/helpers',
    );
    config.resolve.alias['@babel/runtime'] = path.resolve(__dirname, 'node_modules/@babel/runtime');

    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['@/assets'] = path.resolve(__dirname, 'src/assets');
    config.resolve.extensions = ['.tsx', '.ts', '.js', '.mjs', '.cjs'];
    config.resolve.mainFields = ['browser', 'module', 'main'];

    config.stats = {
      errorDetails: true,
      modules: true,
      reasons: true,
    };

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      asyncWebAssembly: true,
    };

    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'localhost',
      //   pathname: '/api/media/getimages/avatars/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'localhost',
      //   pathname: '/api/media/get/images/avatars/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'localhost',
      //   pathname: '/api/media/get/pages/images/achivements/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'localhost',
      //   pathname: '/api/achivements/qr_code/**',
      // },

      {
        protocol: 'http',
        hostname: '192.168.2.144',
        pathname: '/api/media/getimages/avatars/**',
      },
      {
        protocol: 'http',
        hostname: '45.140.178.217',
        pathname: '/api/media/get/images/avatars/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.2.144',
        pathname: '/api/media/get/images/avatars/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/getimages/avatars/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/get/images/avatars/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/get/pages/images/achivements/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/get/pages/images/achivements/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/achivements/qr_code/**',
      },
    ],
  },
};

export default configuredWithPWA(nextConfig);
