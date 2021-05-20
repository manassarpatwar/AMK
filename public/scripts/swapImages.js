function inputImage(){
    const inputWrapper= document.getElementById('input_wrapper');
    const imageForm = document.getElementById('swap-image');
    if (imageForm.style.display !== 'none') {
        imageForm.style.display = 'none';
        inputWrapper.style.height = '0px';
    }
    else {
        imageForm.style.display = 'block';
        scrollBottom(50);
        inputWrapper.style.height = '120px';
    }
}

function scrollBottom(val){
    $("html, body").animate({
        scrollTop: $(
            'html, body').get(0).scrollHeight
    }, val);
}
async function swapImage(roomNo){
    const imageBase64 = document.getElementById('image_base_64');
    let imageForm = document.getElementById('swap-image');
    const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
    // @todo save updated image in the database - what name and description?
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
    
    let img = {
        roomNo: roomNo,
        title: img_title,
        author: name,
        description: description,
        data: imageBase64.value.split(',')[1]
    }

    if(url){
        chat.emit('sendUrl', roomNo, url, name);
        // @todo Send swapped image to server
        // sendImage('')
    }
    swapImage(roomNo)
}

chat.on('sendUrl', function(roomNo, imageUrl, name){
    console.log("inside chat.on");
    const imageBase64 = document.getElementById('image_base_64');

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
                $('#swap_alert').removeClass('d-none');
                $('#swapper_name').html(name);
                swapImage(roomNo)
            });
        },
        error:function(){
            
        }
    });
});