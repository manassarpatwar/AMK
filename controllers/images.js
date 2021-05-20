
const Image = require('../models/images');
const fs = require('fs');
const path = require('path')

function convertToBase64(file){
    // convert binary data to base64 encoded string
    return 'data:image/jpeg;base64,'+fs.readFileSync(file, 'base64')
}


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
