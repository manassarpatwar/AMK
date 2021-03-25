function inputImage(){
    let imageForm = document.getElementById('swap-image');
    if (imageForm.style.display !== 'none')
        imageForm.style.display = 'none';
    else
        imageForm.style.display = 'block';
}

function swapImage(roomNo, name) {
    //chat.emit('chat', roomNo, name, "I just swapped an image. Please save all you need and refresh a page to see a new image.");
    const imageUrl = document.getElementById('image_url');
    if (imageUrl.value) {
        console.log("image url", imageUrl.value);
        chat.emit('sendUrl', roomNo, imageUrl.value);
    }
    else
    {
        const imageBase64 = document.getElementById('image_base_64');
        const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
        getCachedData(roomNo).then(data => {
            data.image = newImage;
            updateCachedData(data);
        }).then(location.assign('/chat/'+roomNo+'/'+name));
    }
}

chat.on('sendUrl', function(){
    console.log("inside chat.on");
    const imageBase64 = document.getElementById('image_base_64');
    const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
    getCachedData(roomNo).then(data => {
        data.image = newImage;
        updateCachedData(data);
    })
});