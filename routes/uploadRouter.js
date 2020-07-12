const express = require("express");
/**
 *
 * This is a the upload router has all the routes relative to upload api
 *
 *
 */
const cors = require('./cors')
const router = express.Router();
const multer = require('multer')
const authenticate = require("../authenticate");


const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        /// err = null
        cb(null,'public/images');
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const imageFileFilter = (req,file,cb)=>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return cb(new Error('You can upload only image files') , false)
    }
    cb(null,true)
}

const upload = multer({
    storage : storage,
    fileFilter : imageFileFilter
})
router.use(express.json())

/// routes

router
  .route("/")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  .get(cors.cors,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
      res.statusCode = 403;
    res.end("GET Operation not supported on /imageUpload");
  })
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("PUT Operation not supported on /imageUpload");
  })
  .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("DELETE Operation not supported on /imageUpload");
  })
  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json')
    res.json(req.file)
  })
  




module.exports = router;