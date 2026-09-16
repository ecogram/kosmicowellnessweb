const express = require('express');
const router = express.Router();
const { ApiResponse } = require('../utils/apiResponse');

const generateEmergencyMessage = (req, res) => {
  const lat = req.body.latitude || req.query.latitude || req.body.lat || req.query.lat || '28.6139';
  const lng = req.body.longitude || req.query.longitude || req.body.lng || req.query.lng || '77.2090';
  const name = (req.user && req.user.name) || req.body.name || 'User';

  const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const message = `EMERGENCY ALERT: ${name} requires urgent medical assistance. Current Location: ${mapUrl}. Coordinates: (${lat}, ${lng}). Please send help immediately.`;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        message,
        smsText: message,
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          mapsUrl: mapUrl,
        },
        helplineNumbers: ['112', '108', '102'],
      },
      'Emergency SOS message generated successfully'
    )
  );
};

router.post('/generate-message', generateEmergencyMessage);
router.get('/generate-message', generateEmergencyMessage);

module.exports = router;
