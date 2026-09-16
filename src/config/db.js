const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        const conn = await mongoose.connect(process.env.CLOUD_MONGO_URI);
        console.log(`Database Connected Successfully: ${conn.connection.host} ✅`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = dbConnection;