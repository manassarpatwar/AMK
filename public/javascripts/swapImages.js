function inputImage(){
    let imageForm = document.getElementById('swap-image');
    let inputField = document.getElementById('input');
    let wrapper = document.getElementById('wrapper');

    if (imageForm.style.display !== 'none')
        imageForm.style.display = 'none';
    else
        imageForm.style.display = 'block';

    if (inputField.style.position === 'static') {
        console.log("wtf");
        inputField.style.position = 'fixed';
        inputField.style.transform = 'translateX(-50%)';

    }
    else{
        inputField.style.position = 'static';
        inputField.style.transform = 'none';
        wrapper.style.height = '100%';
        console.log(wrapper.style.height);
    }
    console.log(inputField.style.position);

}

function swapImage(roomNo, name) {
    inputImage();
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
        });
        chat.emit('swapped', roomNo);
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
    writeOnHistory('<b>' + 'The image has been swapped.' + '</b>' + ' Please save all you need and refresh a page to see a new image. ');
});

chat.on('swapped', function(){
    writeOnHistory('<b>' + 'The image has been swapped.' + '</b>' + ' Please save all you need and refresh a page to see a new image. ');
    // alert("The image has been swapped. Please save all you need and refresh a page to see a new image.");

});