let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
let Image = new Schema(
    {
        title: {type: String, required: true, max: 100},
        author: {type: String, required: true, max: 100},
        description: {type: String, required: true, max: 500},
        img:
            {
                data: Buffer,
                contentType: String
            }
    }
);

// Virtual for a character's age
// Character.virtual('age')
//     .get(function () {
//         const currentDate = new Date().getFullYear();
//         const result= currentDate - this.dob;
//         return result;
//     });

Image.set('toObject', {getters: true, virtuals: true});


let imageModel = mongoose.model('Image', Image );

module.exports = imageModel;
