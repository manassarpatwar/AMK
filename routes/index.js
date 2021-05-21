var express = require('express');
var router = express.Router();
var fs = require('fs');

const image = require('../controllers/images');
const initDB= require('../controllers/init');
initDB.init();



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
  let directPath = "/private_access/images/" + req.body.title + "_" + req.body.roomNo + '.png';
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
  image.insert(img, res);
});

/* GET all images from the database */
router.get('/images', function(req, res, next) {
  image.getAll(req, res);
});

/* GET the last image from the database from the given room */
router.get('/imageByRoom/:roomNo', function(req, res, next) {
  let data = {roomNo: req.params.roomNo};
  image.getByRoom(data, res);
});

/* GET image from the database with given id */
router.get('/imageById/:id', function(req, res, next) {
  let data = {_id: req.params.id};
  image.getById(data, res);
});

/* GET all the rooms */
router.get('/rooms', function(req, res, next) {
  image.getRooms(req, res);
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
// router.get('/chat/:room', function(req, res, next) {
//   var room = req.params.room;
//   console.log('all');
//   var user = 'Anonymous' + parseInt((Math.random()*1000),10);
//   res.render('chat', { room: room, user: user, title: 'Chat'});
// });

module.exports = router;
