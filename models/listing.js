// models/listing.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  
 
  geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      default: 'Point',
      
    },
    coordinates: {
      type: [Number], 
      default: [78.9629, 20.5937], 
    
    }
  }
 
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;