const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const petSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  pet: {
    type: String,
    required: true,
  },
  petname: {
    type: String,
  },
  gender: {
    type: String,
  },
  colour: String,
  breed: String,
  age: Number,
  size:String,
  date: Date,
  reward:Number,
  description: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  geohash: String,
  userId: { type: Schema.Types.ObjectId },
  images: [
    {
      path: {
        type: String,
        required: true,
      },
    },
  ],
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
