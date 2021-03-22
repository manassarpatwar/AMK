function inputImage(){
    let imageForm = document.getElementById('swap-image');
    imageForm.style.display = 'block';
}

async function swapImage() {
    let roomNo = document.getElementById('roomNo').textContent.trim();
    let name = document.getElementById('user').textContent.trim();
    const imageBase64 = document.getElementById('image_base_64');
    const new_image = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
    getCachedData(room).then(data => {data.image = new_image; updateCachedData (data)}).then(location.assign('/chat/'+roomNo+'/'+name));

}