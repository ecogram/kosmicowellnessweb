const express = require('express');
const router = express.Router();
const { ApiResponse } = require('../utils/apiResponse');

const checkUpdates = (req, res) => {
  const clientVersion = req.query.version || req.query.appVersion || '1.0.0';
  const latestVersion = '1.0.3';
  const minRequiredVersion = '1.0.0';

  const isUpdateAvailable = clientVersion !== latestVersion;
  const isForceUpdate = false;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        updateAvailable: isUpdateAvailable,
        forceUpdate: isForceUpdate,
        currentVersion: clientVersion,
        latestVersion,
        minSupportedVersion: minRequiredVersion,
        releaseNotes: 'Performance enhancements, new saved payment methods, and live health sync.',
        appStoreUrl: 'https://apps.apple.com/app/kosmico-wellness',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kosmicowellness.app',
      },
      isUpdateAvailable ? 'New update available' : 'App is up to date'
    )
  );
};

router.get('/check', checkUpdates);
router.get('/latest', checkUpdates);

module.exports = router;
