const express = require("express");
const mongoose = require("mongoose");
const cors = require('./cors')
const Promotions = require("../models/promotions");
const authenticate = require('../authenticate')
/**
 *
 * This is a the promotions router has all the routes relative to promotions api
 *
 *
 */
const router = express.Router();

/// routes
router
  /**
   * @route /promotions/
   */
  .route("/")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @GET gets all  promos
   */
  .get(cors.cors,(req, res, next) => {
    Promotions.find({})
      .then((promos) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promos);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  })
  /**
   *
   * @POST adds one promotion with data
   */
  .post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Promotions.create(req.body)
      .then((promo) => {
        res.status(200).json(promo);
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
    res.end("Put Operation not supported on /promotions");
  })
  /**
   * @DELETE deletes all promos
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    Promotions.deleteMany({})
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
   * @route /promotions/id_of_promo
   */
  .route("/:promoId")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @GET gets promo that matches promoId
   */
  .get(cors.cors,authenticate.verifyUser,(req, res) => {
    Promotions.findById(req.params.promoId)
      .then((promo) => {
        res.status(200).json(promo);
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
      "POST operation is not supported on /promotions/" + req.params.promoId
    );
  })
  /**
   *
   * @PUT Updates promotion that matches promoId with data
   */
  .put(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    Promotions.findByIdAndUpdate(
      req.params.promoId,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    ).then((promo) => {
      res.status(200).json(promo);
    });
  })
  /**
   *
   * @DELETE Deletes promotion that matches promoId
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res) => {
    Promotions.findByIdAndDelete(req.params.promoId)
        .then(resp => {
          res.status(200).json(resp)
        })
  });

module.exports = router;
