const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Connected to Database Successfully");
  } catch (error) {
    console.error("Could not connect to Database!", error);
    process.exit(1);
  }
};
