var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

// in index.ejs in submit button redirect to route with the room number?
//  but that would require rewriting socket.io and .ejs files quite drastically I think?
router.post('/chats/:room', function(req, res, next) {
  var room= req.params.room;
  var img= req.body.img;
  var name= req.body.name;

  // need to create chat.ejs
  res.render('chat', { room: room, image: img, name: name });

});


module.exports = router;
