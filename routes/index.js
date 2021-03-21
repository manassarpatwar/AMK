var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

router.post('/chat/k/k', function(req, res, next) {
  res.redirect('index')
});

/* GET chat page. */
router.get('/chat/:room/:user', function(req, res, next) {
  var room = req.params.room;
  console.log('all');
  var user = req.params.user;
  res.render('chat', { room: room, user: user, title: 'Chat'});
});

module.exports = router;
