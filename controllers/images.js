
const Image = require('../models/images');
const fs = require('fs');
const path = require('path')

function convertToBase64(file){
    // convert binary data to base64 encoded string
    return 'data:image/jpeg;base64,'+fs.readFileSync(file, 'base64')
}

/**
 * saves image to mongoDB
 */
exports.insert = function (req, res) {
    console.log("inside insert")
    let userData = req;
    console.log(userData);
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        let image = new Image({
            roomNo: userData.roomNo,
            title: userData.title,
            author: userData.author,
            description: userData.description,
            url: userData.url
        });
        console.log('received: ' + image);

        image.save(function (err, results) {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(image));
        });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}

/**
 * returns the list of all images stored in MongoDB
 */
exports.getAll = function (req, res) {
    try {
        Image.find({},
            'roomNo title author description url',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(images));
                console.log(images)
            });
    } catch (e) {
        res.status(500).send('error '+ e);
    }
}

/**
 * gets the first image saved in a given room,
 * based on the path, gets base64,
 * returns the image data * @param userData room  number
 */
exports.getByRoom = function (userData, res) {
    try {
        Image.find({roomNo: userData.roomNo},
            'roomNo title author description url',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');

                const image = images[0];
                const url = path.resolve(__dirname, '..'+image['url']);

                const base64 = convertToBase64(url)
                const imageData = {}
                imageData['title'] = image['title']
                imageData['author'] = image['author']
                imageData['description'] = image['description']
                imageData['base64'] = base64
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(imageData));
            });
    } catch (e) {
        res.status(500).send('error '+ e);
    }
}

/**
 * gets the image with a given id
 * based on the path, gets base64,
 * returns the image data
 * @param userData image id
 */
exports.getById = function (userData, res) {
    try {
        Image.find({_id: userData._id},
            'roomNo title author description url',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');

                const image = images[0];
                const url = path.resolve(__dirname, '..'+image['url']);

                const base64 = convertToBase64(url)
                const imageData = {}
                imageData['title'] = image['title']
                imageData['author'] = image['author']
                imageData['description'] = image['description']
                imageData['base64'] = base64
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(imageData));
            });
    } catch (e) {
        res.status(500).send('error '+ e);
    }
}

/**
 * gets the list of all the rooms based on the saved pictures in mongoDB
 */
exports.getRooms = function (req, res) {
    try {
        Image.find({},
            'roomNo title author description url',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');

                let rooms = []
                for (let img of images){
                    let room = img["roomNo"]
                    if (!(rooms.includes(room)) && !(room === undefined)){
                        rooms.push(room);
                    }
                }

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(rooms));
                console.log(rooms);
            });
    } catch (e) {
        res.status(500).send('error '+ e);
    }
}
