/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');

// const runtimeCaching = require('next-pwa/cache');
// const withPWA = require('next-pwa')({
//   disable: process.env.NODE_ENV === 'development',
//   dest: 'public',
//   runtimeCaching,
// });

const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['rc-table', 'rc-util', '@react-google-maps/api'],
  i18n,
  images: {
    domains: [
      'via.placeholder.com',
      'res.cloudinary.com',
      's3.amazonaws.com',
      '18.141.64.26',
      '127.0.0.1',
      'localhost',
      'picsum.photos',
      'pickbazar-sail.test',
      'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com',
      'lh3.googleusercontent.com',
      '127.0.0.1:8000',
    ],
  },
  webpack: (config, { webpack, isServer }) => {
    // Fix for react/jsx-runtime resolution in ESM modules like @react-google-maps/api
    const jsxRuntimePath = require.resolve('react/jsx-runtime');
    const jsxDevRuntimePath = require.resolve('react/jsx-dev-runtime');

    // Configure aliases - this is the primary fix
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': jsxRuntimePath,
      'react/jsx-dev-runtime': jsxDevRuntimePath,
    };

    // Fix for react-quill CSS import - resolve to quill package
    // Add alias for the CSS import - this is the primary fix
    // Use a relative path that webpack can resolve
    config.resolve.alias['react-quill/dist/quill.snow.css'] = 'quill/dist/quill.snow.css';

    // Use webpack's NormalModuleReplacementPlugin to handle react/jsx-runtime imports
    // This ensures ESM modules can resolve the jsx-runtime correctly
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react\/jsx-runtime$/,
        jsxRuntimePath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^react\/jsx-dev-runtime$/,
        jsxDevRuntimePath
      ),
      // Fix for react-quill CSS import path - redirect to quill package
      new webpack.NormalModuleReplacementPlugin(
        /react-quill\/dist\/quill\.snow\.css$/,
        'quill/dist/quill.snow.css'
      )
    );

    return config;
  },
  ...(process.env.APPLICATION_MODE === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
};

module.exports = nextConfig;
