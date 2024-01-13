const mongoose = require('mongoose');

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
  images: [
    {
      path: {
        type: String,
        required: true,
      },
    },
  ],
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
