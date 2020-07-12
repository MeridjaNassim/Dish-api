const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const { authenticate } = require("passport");
const router = express.Router();
const cors = require('./cors')
const auth = require('../authenticate')
router
  /**
   *  @route /users/
   */
  .route("/")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  .get(cors.corsWithOptions,auth.verifyUser,auth.verifyAdmin,(req, res, next) => {
    User.find({}).then(users =>{
      res.status(200).json({users})
    })
    .catch(err => {
      next(err)
    })
  });

router
  /**
   * Used to register the users
   * @route /users/signup
   */
  .route("/signup")

  .post(cors.corsWithOptions,(req, res, next) => {
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.status(500).json({ err });
        } else {
          if(req.body.firstName) {
            user.firstName = req.body.firstName
          }
          if(req.body.lastName) {
            user.lastName = req.body.lastName
          }
          user.save((err,user)=>{
            if(err){
              res.status(500).json({ err });
              return ;
            }
            passport.authenticate("local")(req, res, () => {
              res.status = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ success: true, status: "Registration successful!" });
            });
          })
         
        }
      }
    );
  });

router
  /**
   * Used to login the users
   * @route /users/login
   */
  .route("/login")

  .post(cors.corsWithOptions,passport.authenticate('local'),(req, res, next) => {
        const token = auth.getToken({_id : req.user._id})

        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success: true,token , status : 'You are successfully logged in'})
  });

router

  .route("/logout")

  .get(cors.corsWithOptions,(req, res) => {
    req.logout();
    res.redirect('/')
  });

router
  .get('/facebook/token',passport.authenticate('facebook-token'),(req,res)=>{
    if(req.user){
      const token = auth.getToken({_id : req.user._id})
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({success: true,token , status : 'You are successfully logged in'})
    }
  })
module.exports = router;
