const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user : {
        type : mongoose.SchemaTypes.ObjectId,
        unique : true,
        ref : 'User'
    },
    dishes : [
        {
            type : mongoose.SchemaTypes.ObjectId,
            unique : true,
            ref : 'Dish'
        }
    ]
})

const FavoriteModel = mongoose.model('Favorite',favoriteSchema);

module.exports = FavoriteModel;