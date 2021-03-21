function inputImage(){
    let imageForm = document.getElementById('swap-image');
    imageForm.style.display = 'block';
}

async function swapImage() {
    let room = document.getElementById('roomNo').textContent.trim();
    let name = document.getElementById('user').textContent.trim();
    let imageUrl= document.getElementById('image_url').value;
    console.log("done");
    // I need to call the function which saves the new image to the database
    await loadImageUrl(room, imageUrl, false);
    if (!name) name = 'Anonymous' + parseInt((Math.random()*1000),10);
    location.assign('/chat/'+room+'/'+name);
}