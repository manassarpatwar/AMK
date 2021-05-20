var express = require('express');
var router = express.Router();
var fs = require('fs');

const image = require('../controllers/images');
const initDB= require('../controllers/init');
initDB.init();


/* GET home page. */
router.get('/', function(req, res, next) {
  // to get image path, add parent path to path from mongoDB!!!
  res.render('index', { title: 'Image Browsing' });
});

/* save image in the database*/
router.post('/save', function(req, res, next) {
  // create separate directory for each author
  let parent = __dirname.replace("\\routes", "");
  let dirPath = parent + "/private_access/images"
  if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath);
  }
  let directPath = "/private_access/images/" + req.body.roomNo + '_' + req.body.title;
  let imagePath = parent + directPath;
  fs.writeFile(imagePath, req.body.data, 'base64', err => {
    console.log(err);
  })

  let img = {
    roomNo: req.body.roomNo,
    title:  req.body.title,
    author: req.body.author,
    description: req.body.description,
    url: directPath
  }
  // console.log(req.body);
  image.insert(img, res);
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

/* GET all the rooms*/
router.get('/get_rooms/', function(req, res, next) {
  image.getRooms(req, res);
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
