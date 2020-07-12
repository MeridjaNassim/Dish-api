const express = require("express");
const mongoose = require("mongoose");
const authenticate = require('../authenticate')
const Leaders = require("../models/leaders");
const cors = require('./cors');
/**
 *
 * This is a the leaders router has all the routes relative to leaders api
 *
 *
 */
const router = express.Router();

/// routes
router
  /**
   * @route /leaders/
   */
  .route("/")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @GET gets all  leaders
s
   */
  .get(cors.cors,(req, res, next) => {
    Leaders.find({})
      .then((leaders) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(leaders);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  /**
   *
   * @POST adds one leader with provided data
   */
  .post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Leaders.create(req.body)
      .then((leader) => {
        res.status(200).json(leader);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  /**
   * @PUT not supported on this route
   */
  .put(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    res.end("Put Operation not supported on /leaders");
  })
  /**
   * @DELETE deletes all leaders
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    Leaders.deleteMany({})
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  });
router
  /**
   * @route /leaders/id_of_leader

   */
  .route("/:leaderId")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @GET gets leader that matches leaderId
   */
  .get(cors.cors,(req, res) => {
    Leaders.findById(req.params.leaderId)
      .then((leader) => {
        res.status(200).json(leader);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  /**
   *
   * @POST Operation not supported on this route
   */
  .post(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    res.end(
      "POST operation is not supported on /leaders/" + req.params.leaderId
    );
  })
  /**
   *
   * @PUT Updates leader that matches leaderId with data
   */
  .put(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    ).then((leader) => {
      res.status(200).json(leader);
    });
  })
  /**
   *
   * @DELETE Deletes leader that matches leaderId
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    Leaders.findByIdAndDelete(req.params.leaderId).then((resp) => {
      res.status(200).json(resp);
    });
  });

module.exports = router;
