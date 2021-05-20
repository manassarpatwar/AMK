
const Image = require('../models/images');

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

exports.getByAuthor = function (userData, res) {
    try {
        Image.find({author: userData.author},
            'roomNo title author description url',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(images));
            });
    } catch (e) {
        res.status(500).send('error '+ e);
    }
}
