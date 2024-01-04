const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    emailVerify: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true
    },
    phoneNumber: String,
    profileImage: {
        type: String,
        default: 'image/profile.png'
    },
    role: { type: String, default: "user" },
    suspend: {type:Boolean,default:false},
    verificationCode:{type:String}
  }, {
    timestamps: true // This will add createdAt and updatedAt fields
});

  // Compare the given password with the st ored hashed password
  userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  };
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;