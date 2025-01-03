const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config({'path':'./.env'},);
const cors = require("cors");
const cookieParser = require("cookie-parser")
const userRouter=require("./routes/userRoute")
const folderRouter=require("./routes/folderRoute")
const formRouter=require("./routes/formRoute")
const responseRouter = require("./routes/responseRoute")
const workspaceRoute = require("./routes/workspaceRoute")



// const path = require("path")


const PORT = process.env.PORT || 3000;

const app = express();
app.use(cookieParser())

app.use(express.json());

// app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: 'https://form-builder-ravi-raj.netlify.app', 
    credentials: true      
  }));


// Connect to MongoDB
mongoose
.connect(process.env.MONGO_URI)
.then(() => {console.log('Connected to MongoDB')})
.catch(err => {console.log('Failed to connect to MongoDB', err)});

app.use("/user",userRouter)
app.use("/folder",folderRouter)
app.use("/form",formRouter)
app.use("/responses", responseRouter);
app.use("/workspace",workspaceRoute);



app.get('/health', (req, res) => {
    // res.send
    res.json({
        message: 'Formbot  API is working fine',
        status: 'Working fine',
        date: new Date().toLocaleDateString()
    });
});

// REDIRECT PAGE TO 404
app.use("*", (req, res) => {
    res.status(404).json({
        message: 'Error loading page',
        status: 'Error',
    });
});
//localhost:3000/healt


app.listen(PORT, () => {
    console.clear();
    console.log(`Server is running on port ${PORT}`);
});
