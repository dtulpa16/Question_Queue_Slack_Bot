const Student = require('../models/student');
const express = require('express');
const router = express.Router();

router.post('/', async(req,res)=>{
    console.log(req.body)
})


module.exports = router;