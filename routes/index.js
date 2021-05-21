var express = require('express');
var router = express.Router();


/* GET home page. */
/**
 * @swagger
 * /:
 *   get:
 *     description: Home page
 *     responses:
 *       200:
 *         description: Renders the home page.
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

/* GET chat page. */
/**
 * @swagger
 * /chat/:room/:user
 *   get:
 *     description: Chat with username
 *     responses:
 *       200:
 *         description: Renders the chat page with a username.
 */
router.get('/chat/:room/:user', function(req, res, next) {
  let room = req.params.room;
  let user = req.params.user;
  res.render('chat', { title: 'Chat', room: room, user: user});
});

/* GET chat page. */
/**
 * @swagger
 * /chat/:room
 *   get:
 *     description: Anonymous Chat
 *     responses:
 *       200:
 *         description: Renders the chat page with an anonymous username.
 */
router.get('/chat/:room', function(req, res, next) {
  var room = req.params.room;
  console.log('all');
  var user = 'Anonymous' + parseInt((Math.random()*1000),10);
  res.render('chat', { room: room, user: user, title: 'Chat'});
});

module.exports = router;
