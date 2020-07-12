const express = require("express");
/**
 *
 * This is a the dishes router has all the routes relative to dishes api
 *
 *
 */
const cors = require('./cors');
const router = express.Router();
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");
const authenticate = require("../authenticate");
/// routes
router
  .route("/")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @route : Open GET route that GETS all dishes with their comments 
   * 
   */
  .get(cors.cors,(req, res, next) => {
    Dishes.find({})
      .populate("comments.author")
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed POST route that adds one dish 
   * @restrict : Only a User that has admin previlege can post a new Dish
   */
  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish created, ", dish);
          res.setHeader("Content-Type", "application/json");
          res.status(200).json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed PUT route that updates one dish ( Not supported on this route)
   * @restrict : Only a User that has admin previlege can access this route 
   */
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    res.end("Put Operation not supported");
  })
  /**
   * @route : Closed DELETE route that deletes all dishes  
   * @restrict : Only a User that has admin previlege can access this route 
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    Dishes.deleteMany({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

router
  .route("/:dishId")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @route : Open GET route that GETS one dish with its comments 
   * 
   */
  .get(cors.cors,(req, res) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed POST route that adds one dish ( Not supported on this route)
   * @restrict : Only a User that has admin previlege can access this route 
   */
  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    res.end("POST operation is not supported");
  })
  /**
   * @route : Closed PUT route that updates one dish
   * @restrict : Only a User that has admin previlege can access this route 
   */
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed DELETE route that deletes one dish 
   * @restrict : Only a User that has admin previlege can access this route 
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    Dishes.findByIdAndDelete(req.params.dishId)
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

router
  .route("/:dishId/comments")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @route : Open GET route that GETS all specific dish comments 
   * 
   */
  .get(cors.cors,(req, res) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          if (dish) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.statusCode = 404;
            return next(404);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed POST route that adds one comment to this  dish 
   * @restrict : Any logged in user has to  access this route 
   */
  .post(cors.corsWithOptions,authenticate.verifyUser, (req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.statusCode = 404;
            return next(404);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed PUT route (NOT supported)
   * @restrict : Admin only route
   */
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes/" +
        req.params.dishId +
        "/comments"
    );
  })
  /**
   * @route : Closed DELETE route that deletes all dish comments
   * @restrict : Admin only route ( only admin can deletes all the comments (for example to disable comment feature form dish))
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish) {
            for (let i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.statusCode = 404;
            return next(404);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

router
  .route("/:dishId/comments/:commentId")
  .options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
  })
  /**
   * @route : Open GET route that GETS one comment of a specific dish 
   * 
   */
  .get(cors.cors,(req, res) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          if (dish && dish.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.statusCode = 404;
            return next(404);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found");
            err.statusCode = 404;
            return next(404);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed POST route (NOT supported)
   * @restrict : Admin only route
   */
  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
    res.end(
      "POST operation on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId +
        " is not supported"
    );
  })
  /**
   * @route : Closed PUT route  that updates a Comment (rating , comment body)
   * @restrict : Only the user that posted this comment can modify it (see body of the handler)
   */
  .put(cors.corsWithOptions,authenticate.verifyUser, (req, res,next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish && dish.comments.id(req.params.commentId)) {
            /// checking if the the user is the one who posted this comment
            let authorId = dish.comments.id(req.params.commentId).author._id;
            let userId = req.user._id
            let equ = userId.equals(authorId)
            if(!equ){
              let err = new Error('You are not authorized to perform this action')
              res.status(403).send({msg : "Authorized to perform this action"})
              return;
            }
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.statusCode = 404;
            return next(err);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found");
            err.statusCode = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  /**
   * @route : Closed DELETE route  that deletes a Comment 
   * @restrict : Only the user that posted this comment can delete it (see body of the handler)
   */
  .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res,next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish && dish.comments.id(req.params.commentId)) {
            /// checking if the the user is the one who posted this comment
            let authorId = dish.comments.id(req.params.commentId).author._id;
            let userId = req.user._id
            let equ = userId.equals(authorId)
            console.log(equ)
            if(!equ){
              let err = new Error('You are not authorized to perform this action')
              res.status(403).send({msg : "Not authorized to perform this action"})
              return;
            }
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.statusCode = 404;
            return next(404);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found");
            err.statusCode = 404;
            return next(404);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });
module.exports = router;
