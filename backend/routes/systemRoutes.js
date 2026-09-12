const express = require('express');
const router = express.Router();
const { ApiResponse } = require('../utils/apiResponse');

router.get('/status', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'online',
        serverTime: new Date().toISOString(),
        version: '1.2.0',
        environment: process.env.NODE_ENV || 'production',
        services: {
          database: 'connected',
          auth: 'active',
          payment: 'ready',
          shipping: 'ready',
        },
      },
      'Kosmico Wellness System is fully operational'
    )
  );
});

router.get('/updates/latest', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        latestVersion: '1.2.0',
        minSupportedVersion: '1.0.0',
        forceUpdate: false,
        releaseNotes: 'Performance improvements, real-time OTP enhancements, and full health tracker sync.',
        appStoreUrl: 'https://apps.apple.com/app/kosmico-wellness',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kosmicowellness.app',
      },
      'Latest update info retrieved'
    )
  );
});

module.exports = router;
