function inputImage(){
    let imageForm = document.getElementById('swap-image');
    if (imageForm.style.display !== 'none')
        imageForm.style.display = 'none';
    else
        imageForm.style.display = 'block';
}

async function swapImage(roomNo, name) {
    const imageBase64 = document.getElementById('image_base_64');
    const newImage = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
    getCachedData(roomNo).then(data => {
        data.image = newImage; 
        updateCachedData (data);
    }).then(location.assign('/chat/'+roomNo+'/'+name));

}