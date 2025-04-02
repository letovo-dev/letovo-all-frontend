const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.2.144',
        pathname: '/api/media/getimages/avatars/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.2.144',
        pathname: '/api/media/get/images/avatars/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/api/media/getimages/avatars/**',
        search: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/api/media/get/images/avatars/**',
        search: '',
      },
    ],
  },
};

module.exports = nextConfig;
