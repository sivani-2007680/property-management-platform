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
  
  // --- CORRECTED & ENHANCED WITH DEFAULT FALLBACKS FOR SAFETY ---
  geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      default: 'Point', // Automatically sets it to 'Point' if missing
      
    },
    coordinates: {
      type: [Number], 
      default: [78.9629, 20.5937], // Fallback coordinates (India) so old listings don't crash the map!
    
    }
  }
  // -------------------------------------------------------------
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;