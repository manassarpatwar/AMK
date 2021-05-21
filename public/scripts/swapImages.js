function inputImage(){
    // inserting from database only in the main page
    //document.getElementById("choose_picture").style.display = "none";
   // const inputWrapper= document.getElementById('input_wrapper');
   const imageForm = document.getElementById('swap-image');
        $('#myModal').modal('show');
        imageForm.style.display = 'block';
}


function scrollBottom(val){
    $("html, body").animate({
        scrollTop: $(
            'html, body').get(0).scrollHeight
    }, val);
}
async function swapImage(roomNo, imgTitle, description){
    const imageBase64 = document.getElementById('image_base_64');
    let imageForm = document.getElementById('swap-image');
    const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
    // @todo save updated image in the database - what name and description?
    getCachedData(roomNo).then(data => {
        data.image = newImage;
        data.history = [];
        data.annotations = [];     
        data.title = imgTitle;
        data.description = description;
        updateCachedData(data);
        canvas.updateBackground(newImage.base64);
        imageForm.style.display = 'none';
        clearHistory();
    });
}

function closeModal(){
    $('#myModal').modal('hide');
    document.getElementById('img_title').value = "";
    document.getElementById('description').value = "";
}

async function swapAndSendImage(roomNo, name) {
    closeModal();
    const imageBase64 = document.getElementById('image_base_64');
    const url = imageBase64.getAttribute("url");
    const imgTitle = document.getElementById('img_title').value;
    const description = document.getElementById('description').value;

    let img = {
        roomNo: roomNo,
        title: imgTitle,
        author: name,
        description: description,
        data: imageBase64.value.split(',')[1]
    }

    sendImage(img).then(() => chat.emit('sendUrl', roomNo, name, imgTitle, description, url))
    swapImage(roomNo, imgTitle, description)
}

chat.on('sendUrl', function(roomNo, name, title, description, url){
    const imageBase64 = document.getElementById('image_base_64');
    if(url){
        $.ajax({
            url: url,
            cache: false,
            xhrFields:{
                responseType: 'blob'
            },
            success: function(blob){
                convertToBase64(blob).then(data => {
                    const base64 = data.result;
                    imageBase64.value = base64;
                    imageBase64.setAttribute("url", url);
                    $('#swap_alert').removeClass('d-none');
                    $('#swapper_name').html(name);
                    $('#swapper_title').html(title);
                    $('#swapper_description').html(description);

                    swapImage(roomNo, title, description)
                });
            },
            error:function(){
                
            }
        });
    }else{
        getImage(roomNo).then(function(data){
            console.log(data)
            const base64 = data['base64'];
            imageBase64.value = base64;
            imageBase64.setAttribute("url", "");
            $('#swap_alert').removeClass('d-none');
            $('#swapper_name').html(name);
            $('#swapper_title').html(title);
            $('#swapper_description').html(description);

            swapImage(roomNo, title, description)
        })
    }
});

function validateSwapForm(){
    let canvas_style = document.getElementById('preview_canvas').style.display;
    let imgTitle = document.getElementById('img_title').value ;
    let description = document.getElementById('description').value;


    // validate the image name - can't contain any special characters
    let valid_title = true;
    if (imgTitle === "" || (/[<">\/*?:|]+/.test(imgTitle)))
        valid_title = false;

    if (canvas_style === "none" || !valid_title || description === "") {
        document.getElementById("submitSwapped").disabled = true;
        document.getElementById("valid_form_help").style.display = "block";
        if (!valid_title)
            document.getElementById("valid_form_image_name").style.display = "block";
        else
            document.getElementById("valid_form_image_name").style.display = "none";
    }
    else{
        document.getElementById("submitSwapped").disabled = false;
        document.getElementById("valid_form_help").style.display = "none";
        document.getElementById("valid_form_image_name").style.display = "none";
    }
}