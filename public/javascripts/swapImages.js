function inputImage(){
    let imageForm = document.getElementById('swap-image');
    if (imageForm.style.display !== 'none')
        imageForm.style.display = 'none';
    else
        imageForm.style.display = 'block';
}

async function swapImage(roomNo){
    const imageBase64 = document.getElementById('image_base_64');
    let imageForm = document.getElementById('swap-image');
    const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};

    getCachedData(roomNo).then(data => {
        data.image = newImage;
        data.history = [];
        data.annotations = [];
        updateCachedData(data);
        canvas.updateBackground(newImage.base64);
        imageForm.style.display = 'none';
        clearHistory();
    });
}

async function swapAndSendImage(roomNo, name) {
    const imageBase64 = document.getElementById('image_base_64');
    const url = imageBase64.getAttribute("url");
    if(url){
        chat.emit('sendUrl', roomNo, url);
    }
    swapImage(roomNo)
}

chat.on('sendUrl', function(roomNo, imageUrl){
    console.log("inside chat.on");
    $.ajax({
        url: imageUrl,
        cache: false,
        xhrFields:{
            responseType: 'blob'
        },
        success: function(blob){
            convertToBase64(blob).then(data => {
                const base64 = data.result;
                imageBase64.value = base64;
                imageBase64.setAttribute("url", imageUrl);
                swapImage(roomNo)
            });
        },
        error:function(){
            
        }
    });
});