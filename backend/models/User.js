const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: false,
      select: false, // Do not return by default
    },
    role: {
      type: String,
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedPaymentMethods: [
      {
        type: {
          type: String,
          enum: ['UPI'],
          default: 'UPI',
        },
        displayName: { type: String, default: '' },
        upiId: { type: String, default: '' },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'expired', 'none'],
      default: 'trial',
    },
    subscriptionTrialCount: {
      type: Number,
      default: 8,
    },
    trialsRemaining: {
      type: Number,
      default: 8,
    },
    featureTrials: {
      type: Object,
      default: () => ({
        feature1: 2,
        feature2: 2,
        feature3: 2,
        feature4: 2,
      }),
    },
    subscription: {
      status: { type: String, default: 'trial' },
      isActive: { type: Boolean, default: false },
      plan: { type: String, default: 'free_trial' },
      trialsRemaining: { type: Number, default: 8 },
      totalTrials: { type: Number, default: 8 },
      expiresAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);


// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) {
    return;
  }
  
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
