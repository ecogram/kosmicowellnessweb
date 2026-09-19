require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://127.0.0.1:5000/api';
const testEmail1 = `post_user1_${Date.now()}@example.com`;
const testEmail2 = `post_user2_${Date.now()}@example.com`;
const testEmail3 = `post_user3_${Date.now()}@example.com`;

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
};

async function runPostsSocialVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING ALL 12 POSTS & SOCIAL APIS (/api/posts)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  const Otp = mongoose.model(
    'Otp_Temp_PS_All',
    new mongoose.Schema({ email: String, otp: String }, { strict: false }),
    'otps'
  );

  // Authenticate User 1
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User One', email: testEmail1 }),
  });
  await new Promise((r) => setTimeout(r, 300));
  const otpDoc1 = await Otp.findOne({ email: testEmail1.toLowerCase() }).sort({ createdAt: -1 });
  const authRes1 = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail1, otp: otpDoc1 ? otpDoc1.otp : '123456' }),
  });
  const token1 = authRes1.data?.data?.accessToken || authRes1.data?.data?.token;
  const user1Id = authRes1.data?.data?.user?._id || authRes1.data?.data?.user?.id;
  const headers1 = { Authorization: `Bearer ${token1}` };

  // Authenticate User 2
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User Two', email: testEmail2 }),
  });
  await new Promise((r) => setTimeout(r, 300));
  const otpDoc2 = await Otp.findOne({ email: testEmail2.toLowerCase() }).sort({ createdAt: -1 });
  const authRes2 = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail2, otp: otpDoc2 ? otpDoc2.otp : '123456' }),
  });
  const token2 = authRes2.data?.data?.accessToken || authRes2.data?.data?.token;
  const user2Id = authRes2.data?.data?.user?._id || authRes2.data?.data?.user?.id;
  const headers2 = { Authorization: `Bearer ${token2}` };

  // Authenticate User 3
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User Three', email: testEmail3 }),
  });
  await new Promise((r) => setTimeout(r, 300));
  const otpDoc3 = await Otp.findOne({ email: testEmail3.toLowerCase() }).sort({ createdAt: -1 });
  const authRes3 = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail3, otp: otpDoc3 ? otpDoc3.otp : '123456' }),
  });
  const token3 = authRes3.data?.data?.accessToken || authRes3.data?.data?.token;
  const user3Id = authRes3.data?.data?.user?._id || authRes3.data?.data?.user?.id;
  const headers3 = { Authorization: `Bearer ${token3}` };

  console.log(`🔑 Test Users: \n   User 1: ${user1Id}\n   User 2: ${user2Id}\n   User 3: ${user3Id}`);

  let passed = 0;
  let failed = 0;
  let createdPostId = '';

  // 1. POST /posts/ (Create Post)
  console.log('\n--------------------------------------------------------');
  console.log('1️⃣ POST /api/posts/ (Create a new post)');
  const createPayload = {
    content: 'Hello friends!',
    mediaUrls: ['image1.jpg'],
    privacyLevel: 'friends',
    tags: ['chilling'],
    location: 'Mumbai',
  };
  const createRes = await request('/posts', {
    method: 'POST',
    headers: headers1,
    body: JSON.stringify(createPayload),
  });
  createdPostId = createRes.data?.data?.post?._id || createRes.data?.data?._id;
  if (createRes.status === 201 && createdPostId) {
    console.log(`   ✅ PASS: Post created with ID: ${createdPostId}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Create post failed', createRes);
    failed++;
  }

  // 2. GET /posts/feed (Get post feed)
  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ GET /api/posts/feed (Get post feed)');
  const feedRes = await request('/posts/feed', {
    method: 'GET',
    headers: headers1,
  });
  if (feedRes.status === 200 && feedRes.data?.success) {
    console.log(`   ✅ PASS: Feed retrieved. Total posts: ${feedRes.data?.data?.posts?.length || 0}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Get feed failed', feedRes);
    failed++;
  }

  // 3. GET /posts/user/:userId (Get user posts)
  console.log('\n--------------------------------------------------------');
  console.log(`3️⃣ GET /api/posts/user/${user1Id} (Get user posts)`);
  const userPostsRes = await request(`/posts/user/${user1Id}`, {
    method: 'GET',
    headers: headers1,
  });
  if (userPostsRes.status === 200 && userPostsRes.data?.success) {
    console.log(`   ✅ PASS: User posts retrieved. Count: ${userPostsRes.data?.data?.posts?.length || 0}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Get user posts failed', userPostsRes);
    failed++;
  }

  // 4. GET /posts/:id (Get details of single post)
  console.log('\n--------------------------------------------------------');
  console.log(`4️⃣ GET /api/posts/${createdPostId} (Get single post details)`);
  const singleRes = await request(`/posts/${createdPostId}`, {
    method: 'GET',
    headers: headers1,
  });
  if (singleRes.status === 200 && singleRes.data?.success) {
    console.log(`   ✅ PASS: Post details retrieved. Content: "${singleRes.data?.data?.post?.content}"`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Get single post failed', singleRes);
    failed++;
  }

  // 5. PUT /posts/:id (Edit a post)
  console.log('\n--------------------------------------------------------');
  console.log(`5️⃣ PUT /api/posts/${createdPostId} (Edit a post)`);
  const editRes = await request(`/posts/${createdPostId}`, {
    method: 'PUT',
    headers: headers1,
    body: JSON.stringify({ content: 'Updated caption', privacyLevel: 'public' }),
  });
  if (editRes.status === 200 && editRes.data?.success) {
    console.log(`   ✅ PASS: Post edited successfully. New Content: "${editRes.data?.data?.post?.content}"`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Edit post failed', editRes);
    failed++;
  }

  // 6. POST /posts/:id/like (Like/unlike a post)
  console.log('\n--------------------------------------------------------');
  console.log(`6️⃣ POST /api/posts/${createdPostId}/like (Like/unlike post)`);
  const likeRes = await request(`/posts/${createdPostId}/like`, {
    method: 'POST',
    headers: headers1,
  });
  if (likeRes.status === 200 && likeRes.data?.success) {
    console.log(`   ✅ PASS: Post like toggled. isLiked: ${likeRes.data?.data?.isLiked}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Like post failed', likeRes);
    failed++;
  }

  // 7. POST /posts/:id/comments (Add a comment)
  console.log('\n--------------------------------------------------------');
  console.log(`7️⃣ POST /api/posts/${createdPostId}/comments (Add a comment)`);
  const commentRes = await request(`/posts/${createdPostId}/comments`, {
    method: 'POST',
    headers: headers1,
    body: JSON.stringify({ text: 'Nice post!' }),
  });
  if (commentRes.status === 201 && commentRes.data?.success) {
    console.log(`   ✅ PASS: Comment added successfully.`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Add comment failed', commentRes);
    failed++;
  }

  // 8. POST /posts/friend-request/send/:userId (User 1 sends request to User 2)
  console.log('\n--------------------------------------------------------');
  console.log(`8️⃣ POST /api/posts/friend-request/send/${user2Id} (Send friend request to User 2)`);
  const sendFriendRes1 = await request(`/posts/friend-request/send/${user2Id}`, {
    method: 'POST',
    headers: headers1,
  });
  const requestId1 = sendFriendRes1.data?.data?.request?._id;
  if (sendFriendRes1.status === 201 && requestId1) {
    console.log(`   ✅ PASS: Friend request sent to User 2. Request ID: ${requestId1}`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Send friend request failed', sendFriendRes1);
    failed++;
  }

  // 8b. User 1 sends request to User 3 (for reject test)
  console.log('\n--------------------------------------------------------');
  console.log(`8b. Sending friend request from User 1 to User 3 (${user3Id}) for reject test...`);
  const sendFriendRes2 = await request(`/posts/friend-request/send/${user3Id}`, {
    method: 'POST',
    headers: headers1,
  });
  console.log('    sendFriendRes2 raw response:', JSON.stringify(sendFriendRes2, null, 2));
  const requestId2 = sendFriendRes2.data?.data?.request?._id || sendFriendRes2.data?.data?._id;
  console.log(`    Request 2 sent to User 3: status ${sendFriendRes2.status}, Request ID: ${requestId2}`);

  // 9. GET /posts/friend-request/pending (List pending requests for User 2)
  console.log('\n--------------------------------------------------------');
  console.log('9️⃣ GET /api/posts/friend-request/pending (List pending requests for User 2)');
  const pendingRes = await request('/posts/friend-request/pending', {
    method: 'GET',
    headers: headers2,
  });
  if (pendingRes.status === 200 && pendingRes.data?.success && Array.isArray(pendingRes.data?.data)) {
    console.log(`   ✅ PASS: Pending requests retrieved. Found ${pendingRes.data.data.length} pending request(s)`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Get pending requests failed', pendingRes);
    failed++;
  }

  // 10. POST /posts/friend-request/accept/:requestId (User 2 accepts request)
  console.log('\n--------------------------------------------------------');
  console.log(`🔟 POST /api/posts/friend-request/accept/${requestId1} (User 2 accepts request)`);
  const acceptRes = await request(`/posts/friend-request/accept/${requestId1}`, {
    method: 'POST',
    headers: headers2,
  });
  if (acceptRes.status === 200 && acceptRes.data?.success && acceptRes.data.data?.request?.status === 'accepted') {
    console.log(`   ✅ PASS: Friend request accepted successfully (status: ${acceptRes.data.data.request.status})`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Accept friend request failed', acceptRes);
    failed++;
  }

  // 11. POST /posts/friend-request/reject/:requestId (User 3 rejects request)
  console.log('\n--------------------------------------------------------');
  console.log(`1️⃣1️⃣ POST /api/posts/friend-request/reject/${requestId2} (User 3 rejects request)`);
  const rejectRes = await request(`/posts/friend-request/reject/${requestId2}`, {
    method: 'POST',
    headers: headers3,
  });
  if (rejectRes.status === 200 && rejectRes.data?.success && rejectRes.data.data?.request?.status === 'rejected') {
    console.log(`   ✅ PASS: Friend request rejected successfully (status: ${rejectRes.data.data.request.status})`);
    passed++;
  } else {
    console.log('   ❌ FAIL: Reject friend request failed', rejectRes);
    failed++;
  }

  // 12. DELETE /posts/:id (Delete a post)
  console.log('\n--------------------------------------------------------');
  console.log(`1️⃣2️⃣ DELETE /api/posts/${createdPostId} (Delete a post)`);
  const deleteRes = await request(`/posts/${createdPostId}`, {
    method: 'DELETE',
    headers: headers1,
  });
  if (deleteRes.status === 200 && deleteRes.data?.success) {
    console.log('   ✅ PASS: Post deleted successfully');
    passed++;
  } else {
    console.log('   ❌ FAIL: Delete post failed', deleteRes);
    failed++;
  }

  console.log('\n========================================================');
  console.log(`🏁 POSTS & SOCIAL APIS VERIFICATION: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

runPostsSocialVerification();
