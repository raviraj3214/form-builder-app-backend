const express = require("express");
const router = express.Router();


const {createResponse,updateView,getFormAnalysis,updateStart} = require("../controllers/response.controller.js")

// store user resposne
router.post("/", createResponse);

// how many click on the link
router.post("/track-form-view",updateView );

// how many user start the form but not submitted
router.post("/track-form-start", updateStart);


// get Analytics via form id,(track ->view,start,submit )
router.get("/form-analytics/:id", getFormAnalysis);


module.exports = router;
