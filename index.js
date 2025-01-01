const express = require("express");
const app = express();
const dotenv = require("dotenv");
const ConnectDB = require("./dbConnect/config.js");
const cors = require("cors");
const userRoutes = require("./routes/user.js");
const adminRoutes = require("./routes/admin.js");
const responseRoutes = require("./routes/response.js");

dotenv.config({});

const port = process.env.PORT || 3000;

ConnectDB();
app.use(cors());
app.use(express.json());

app.use("/user",userRoutes);
app.use("/admin",adminRoutes);
app.use("/response", responseRoutes);


app.listen(port,()=>{
    console.log(`listen on port ${port}`);
})

