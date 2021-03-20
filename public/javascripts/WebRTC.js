
function initWebRTC(){
    const fileInput = document.getElementById('file_input');

    fileInput.addEventListener('change', (e) => handleFile(e.target.files, output));
    const output = document.getElementById('output');
    const player = document.getElementById('player');
    const canvas = document.getElementById('preview_canvas');
    const ctx = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const takePictureButton = document.getElementById('take_picture');
    const imageUrl = document.getElementById('image_url');
    const imageBase64 = document.getElementById('image_base_64');
    
    const constraints = {
        video: true,
    };

    takePictureButton.addEventListener('click', function(){
        player.srcObject = null;
        player.play();
        navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            // Attach the video stream to the video element and autoplay.
            player.srcObject = stream;
            str = stream;
        });
       
        canvas.style.display = 'none';
        player.style.display = 'block';
        takePictureButton.style.display = 'none';
        captureButton.style.display = 'inline-block';
        imageUrl.style.display = 'none';

        hideImageUrlInput();
    });

    captureButton.addEventListener('click', () => {
        ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
        // Stop all video streams.
        player.srcObject.getVideoTracks().forEach(track => track.stop());
        player.style.display = 'none'
        takePictureButton.style.display = 'inline-block';
        captureButton.style.display = 'none';
        canvas.style.display = 'block';

        imageBase64.value = canvas.toDataURL();
        imageBase64.setAttribute("url", "");
    });

    function handleFile(fileList) {
        let file = null;
        for (let i = 0; i < fileList.length; i++) {
            if (fileList[i].type.match(/^image\//)) {
                file = fileList[i];
                break;
            }
        }
    
        if (file !== null) {
            stopImageCapture();
            hideImageUrlInput();
            canvas.style.display = 'block';

            convertToBase64(file).then(data => {
                const base64 = data.result;
                imageBase64.value = base64;
                imageBase64.setAttribute("url", "");
                preview(base64);
            });
        }
    }
}
            
function stopImageCapture(){
    const player = document.getElementById('player');
    const captureButton = document.getElementById('capture');
    const takePictureButton = document.getElementById('take_picture');

    if(player.srcObject !== null){
        player.srcObject.getVideoTracks().forEach(track => track.stop());
        player.style.display = 'none'
        takePictureButton.style.display = 'inline-block';
        captureButton.style.display = 'none';
    }
}

function clearPreview(imageUrl){
    const canvas = document.getElementById('preview_canvas');
    if(imageUrl === ""){
        canvas.style.display = 'none';
    }else{
        canvas.style.display = 'block';
            
        const img = new Image();
        img.onload = function(){
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        img.src = imageUrl;
    }
}

function preview(base64){
    let canvas = document.getElementById('preview_canvas');
    let context = canvas.getContext('2d');
    const img = new Image();
    img.src = base64;
    img.onload = function(){
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        // get the top left position of the image
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        canvas.getContext('2d').drawImage(img, x, y, img.width * scale, img.height * scale);
        canvas.style.display= 'block';
    }
}