// based on: https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// instead of storing base64 in the database,
// it stores the relative path to the image saved in the system's private folder

let Image = new Schema(
    {
      roomNo: {type: String, required: true, max: 100},
      title: {type: String, required: true, max: 100},
      author: {type: String, required: true, max: 100},
      description: {type: String, required: true, max: 500},
      url: {type: String, required: true, max: 100}
    }
);

Image.set('toObject', {getters: true, virtuals: true});

let imageModel = mongoose.model('Image', Image );

module.exports = imageModel;