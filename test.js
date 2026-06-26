const mongoose = require("mongoose");

const url =
"mongodb+srv://vakasivani98_db_user:QojBtE7QrgtZoHOu@cluster0.bhggdm2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(url)
.then(() => {
    console.log("CONNECTED");
})
.catch(err => {
    console.log("MAIN ERROR:");
    console.log(err);

    if (err.reason && err.reason.servers) {
        for (const [host, server] of err.reason.servers) {
            console.log("\n====================");
            console.log("HOST:", host);
            console.log("TYPE:", server.type);
            console.log("ERROR:", server.error);
        }
    }
});