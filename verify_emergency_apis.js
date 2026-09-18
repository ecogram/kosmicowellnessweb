const BASE_URL = 'http://127.0.0.1:5000/api';

async function runEmergencyVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING EMERGENCY APIS (/api/emergency)');
  console.log('========================================================\n');

  const payload = {
    latitude: 28.7041,
    longitude: 77.1025,
  };

  console.log('1️⃣ Testing POST /api/emergency/generate-message...');
  console.log('   Request Body:', payload);

  try {
    const res = await fetch(`${BASE_URL}/emergency/generate-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`Status: ${res.status} | Response:`, JSON.stringify(data, null, 2));

    if (
      res.status === 200 &&
      data.success &&
      data.data?.location?.latitude === 28.7041 &&
      data.data?.location?.longitude === 77.1025 &&
      data.data?.message?.includes('28.7041')
    ) {
      console.log('\n✅ PASS: POST /api/emergency/generate-message generated valid SOS alert with coordinates!');
    } else {
      console.log('\n❌ FAIL: Unexpected response', data);
    }
  } catch (err) {
    console.log('\n❌ FAIL: Network / execution error ->', err.message);
  }

  console.log('\n========================================================');
  console.log('🏁 EMERGENCY APIS VERIFICATION COMPLETED');
  console.log('========================================================\n');
}

runEmergencyVerification();
