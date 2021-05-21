const mongoose = require('mongoose');
const Image = require('../models/images');

exports.init= function() {
  // uncomment to drop the database
  //
  // Image.remove({}, function(err) {
  //    console.log('collection removed')
  // });

}

