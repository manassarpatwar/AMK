var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

/* GET chat page. */
router.get('/chat/:room/:user', function(req, res, next) {
  let room = req.params.room;
  let user = req.params.user;
  res.render('chat', { title: 'Chat', room: room, user: user});
});

module.exports = router;
