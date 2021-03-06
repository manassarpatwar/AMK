/**
 * opens the form to swap the image
 */
function inputImage(){
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

/**
 * clears and close the form for image swapping
 */
function closeModal(){
  $('#myModal').modal('hide');
  document.getElementById('img_title').value = "";
  document.getElementById('description').value = "";
}

/**
 * saves the image in the databases and calls swapImage to swap image in the chat
 * @param roomNo
 * @param name
 */
async function swapAndSendImage(roomNo, name) {
  const imageBase64 = document.getElementById('image_base_64');
  const url = imageBase64.getAttribute("url");
  const imgTitle = document.getElementById('img_title').value;
  const description = document.getElementById('description').value;
  closeModal();

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

/**
 * given the parameters, it swaps the image in the chat for the current user
 * @param roomNo
 * @param imgTitle
 * @param description
 */
async function swapImage(roomNo, imgTitle, description){
  const imageBase64 = document.getElementById('image_base_64');
  let imageForm = document.getElementById('swap-image');
  const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
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

/**
 * This socket.io event is fired for all the other users except the user who swapped the image
 * Ajax is used to fetch the image. If url is provided, Ajax fetches the blob of the provided url.
 * else Ajax send a request to mongodb and fetches the swapped image
 * @param roomNo
 * @param imgTitle
 * @param description
 * @param url
 */
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
          
          // Swap alert
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

      // Swap alert
      $('#swap_alert').removeClass('d-none');
      $('#swapper_name').html(name);
      $('#swapper_title').html(title);
      $('#swapper_description').html(description);

      swapImage(roomNo, title, description)
    })
  }
});

/**
 * validates all the fields in the swap images form
 */
function validateSwapForm(){
  let canvasStyle = document.getElementById('preview_canvas').style.display;
  let imgTitle = document.getElementById('img_title').value ;
  let description = document.getElementById('description').value;


  // validate the image name - can't contain any special characters
  let validTitle = true;
  if (imgTitle === "" || (/[<">\/*?:|]+/.test(imgTitle)))
    validTitle = false;

  if (canvasStyle === "none" || !validTitle || description === "") {
    document.getElementById("submitSwapped").disabled = true;
    document.getElementById("valid_form_help").style.display = "block";
    if (!validTitle)
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