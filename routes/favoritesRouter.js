const router = require('express').Router();
const cors = require('./cors')
const auth = require('../authenticate')
const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes')
router

    .route('/')

    .get(cors.cors,auth.verifyUser,(req,res,next)=>{
        Favorites.find({user : req.user._id})
                .populate('user')
                .populate('dishes')
                .then(favorites => {
                    res.status(200).json(favorites)
                })
                .catch(err => {
                    res.statusCode = 404;
                    next(err)
                })
    })
    .post(cors.corsWithOptions,auth.verifyUser,async (req,res)=>{
        const {dishes} = req.body
        /// checking if dishes where provided in the body
        if(!dishes || dishes.length === 0 ){
            return res.status(400).json({msg : "You must provide the dishes to add to favorites"})
        }
        let favs = await Favorites.findOne({user : req.user._id})
        if(favs){
            let added = [];
            /// adding only non existant items in the dishes array
            dishes.forEach(async ({_id}) => { /// getting only the _id from the passed object
                /// if it doesnt exist in the favs.dishes and it exists in the databses
                let dish = await Dishes.findById(_id);
                if(dish && !favs.dishes.find(val => val.equals(_id))) {
                    added.push(_id)
                }
            })
            /// adding only the dishes that dont exit using the added array
            favs.dishes = [...favs.dishes,...added]
            await  favs.save()
            res.status(200).json(await Favorites.findOne({user : req.user._id}).populate('user').populate('dishes'))
        }else {
            let favs = await Favorites.create({user : req.user._id,dishes : [...dishes] });
            favs = await Favorites.findOne({user : req.user._id}).populate('user').populate('dishes')
            res.status(200).json(favs)
        }
        

    })
    .delete(cors.corsWithOptions,auth.verifyUser,async (req,res)=>{
        let favs = await Favorites.findOneAndDelete({user : req.user._id}).populate('user').populate('dishes');
        /// check if this user has favs 
        if(favs){
            res.status(200).json(favs)
        }else {
            res.status(400).json({msg : 'No favorites to delete'})
        }

    })

router
    .route('/:dishId')
    .get(cors.corsWithOptions,auth.verifyUser,async (req,res)=>{
        /// checking if the user has favorites saved
        let favs = await Favorites.findOne({user : req.user._id});
        if(favs) {
            /// checking if the favorites contain the id looked for
            let dishId = favs.dishes.find((value) => value.equals(req.params.dishId))
            if(dishId) {
                res.status(200).json(await Dishes.findById(dishId))
            }else {
                res.status(404).json({msg : 'Dish specified does not exist'})
            }
        }else {
            res.status(404).json({msg :'No favorites to return'})
        }
    })
    .post(cors.corsWithOptions,auth.verifyUser,async (req,res)=>{

        const dish = await Dishes.findById(req.params.dishId);
        if(dish) {
            const favorites = await Favorites.findOne({user : req.user._id});
            /// if user already has favorites just append to his favorite dishes
            if(favorites){
                /// checking if the dish is already a favorite
                let alreadyFavorite = favorites.dishes.find(item => item.equals(req.params.dishId));
                if(alreadyFavorite){
                    return res.status(400).json({msg : 'Dish is already a favorite'})
                }
                favorites.dishes.push(req.params.dishId)
                const saved = await favorites.save()
                /// returning the data ;
                let favs = await Favorites.find({user : req.user._id}).populate('user').populate('dishes')
                         
                res.status(200).json(favs)
            }else {
                // create new favorites object for this user
                let favs = await Favorites.create({user : req.user._id , dishes : [req.params.dishId]})
                if(favs){
                    favs = await Favorites.find({user : req.user._id}).populate('user').populate('dishes')
                    res.status(200).json(favs)
                }else {
                    res.status(500).json(JSON.stringify({err : new Error('Couldnt add to favorites')}))
                }
            }
        }else {
            return res.status(404).send('The dish with id '+req.params.dishId+' does not exist')
        }
    })
    .delete(cors.corsWithOptions,auth.verifyUser,async (req,res)=>{
        let favs = await Favorites.findOne({user : req.user._id})
        /// user has favorites
        if(favs){
            favs.dishes = favs.dishes.filter(value => !value.equals(req.params.dishId))
            const saved = await favs.save()
            favs = await Favorites.find({user : req.user._id}).populate('user').populate('dishes')
            res.status(200).json(favs)
        }else {
            res.status(400).json({msg : 'No favorites to delete from'})
        }
    })

module.exports = router