const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add CesiumJS config
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/cesium')
      })
    );

    // Support Cesium's static files
    config.module.rules.push({
      test: /\.(glb|czml|gltf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: 'static/chunks/',
            publicPath: '/_next/static/chunks/',
          },
        },
      ],
    });

    // Copy Cesium Assets to public folder
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium'
              ),
              to: 'public/cesium'
            }
          ]
        })
      );
    }

    return config;
  },
  // Configure Cesium assets copy plugin
  async rewrites() {
    return [
      {
        source: '/cesium/:path*',
        destination: '/node_modules/cesium/Build/Cesium/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 