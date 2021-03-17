const Image = require('../models/images');

exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        let image = new Image({
            title: userData.title,
            author: userData.author,
            description: userData.description,
            img: userData.img
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
