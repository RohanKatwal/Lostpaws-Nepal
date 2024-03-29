const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      // required: true,
      unique: true
    },
    emailVerify: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password required if no Google ID exists
    }
    },
    phoneNumber: String,
    profileImage: {
      type: String,
      default: '/image/profile.jpg'
    },
    role: { type: String, default: "user" },
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allows null or unique values
    },
    address:String,
    description:String,
    facebook:String,
    instagram:String,
    linkedin:String,
    twitter:String,
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