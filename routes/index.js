var express = require('express');
var router = express.Router();

const image = require('../controllers/images');
const initDB= require('../controllers/init');
initDB.init();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

/* save image in the database*/
router.post('/save', function(req, res, next) {
  image.insert(req, res);
});

/* GET all images from the database*/
router.get('/get_images', function(req, res, next) {
  image.getAll(req, res);
});

/* GET all images from the database*/
router.get('/get_images/:user', function(req, res, next) {
  let data = {author: req.params.user};
  image.getByAuthor(data, res);
});

/* GET chat page. */
router.get('/chat/:room/:user', function(req, res, next) {
  let room = req.params.room;
  let user = req.params.user;
  res.render('chat', { title: 'Chat', room: room, user: user});
});

/* GET chat page. */
router.get('/chat/:room', function(req, res, next) {
  var room = req.params.room;
  console.log('all');
  var user = 'Anonymous' + parseInt((Math.random()*1000),10);
  res.render('chat', { room: room, user: user, title: 'Chat'});
});

module.exports = router;
