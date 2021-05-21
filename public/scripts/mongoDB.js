/**
 * sends post request to save file locally and
 * stores the path and the details of the uploaded image in the MongoDB
 *
 */
function sendImage(imageData) {
    return new Promise(function(resolve, reject){
        $.ajax({
            url: '/save',
            data: imageData,
            type: 'POST',
            success: function (data) {
                resolve(data)
                console.log("saved")
            },
            error: function (xhr, status, error) {
                reject({'error': error.message});
                console.log("failure")
            }
        });
    })
}

/**
 * returns the list of all the images (without base64)
 */
function getImages(){
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/images',
            type: 'GET',
            success: function (data) {
                resolve(data)
            },
            error: function (xhr, status, error) {
                reject('Error: ' + error.message);
            }
        });
    });
}

/**
 * returns the image data, including base64 from mongoDB
 * @param param data to find the image by
 * @param byId if false, searches by room number, if true - searches by image ID
 */
function getImage(param, byId=false){
    let url = "";
    if (!byId){
        url = '/imageByRoom/'+ param
    }
    else
        url = '/imageById/'+ param
    return new Promise(function(resolve, reject){
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                resolve(data)
            },
            error: function (xhr, status, error) {
                reject({'error: ': error.message});
            }
        });
    })
}

/**
 * returns the list of all the created rooms from mongoDB
 */
function getRooms(){
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/rooms',
            type: 'GET',
            success: function (data) {
                resolve(data);
            },
            error: function (xhr, status, error) {
                reject('Error: ' + error.message);
            }
        });
    });
}
