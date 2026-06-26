const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL =
"mongodb+srv://vakasivani98_db_user:QojBtE7QrgtZoHOu@cluster0.bhggdm2.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";

main()
    .then(() => {
        console.log("connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    
    // MODIFIED IN THIS VIDEO:
    // Loops through every entry in data.js and attaches your testing user ID as the owner
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6a3e4095467628132387cd65", // Replace this with an actual user object ID from your DB!
    }));
    
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};