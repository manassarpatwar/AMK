
function initWebRTC(){
    const fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', (e) => handleFile(e.target.files, output));
    const output = document.getElementById('output');
    const player = document.getElementById('player');
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const takePictureButton = document.getElementById('take-picture');
    const imageUrl = document.getElementById('image_url')
    
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
    });

    captureButton.addEventListener('click', () => {
        ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
        // Stop all video streams.
        player.srcObject.getVideoTracks().forEach(track => track.stop());
        player.style.display = 'none'
        takePictureButton.style.display = 'inline-block';
        captureButton.style.display = 'none';
        canvas.style.display = 'block';

        imageUrl.value = canvas.toDataURL();
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
            hideImageUrlInput();
            canvas.style.display = 'block';
            
            const img = new Image;
            img.onload = function(){
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const url = URL.createObjectURL(file);
            imageUrl.value = url;
            img.src = url;
        }
    }
}
            
function stopImageCapture(){
    const player = document.getElementById('player');
    const captureButton = document.getElementById('capture');
    const takePictureButton = document.getElementById('take-picture');

    if(player.srcObject !== null){
        player.srcObject.getVideoTracks().forEach(track => track.stop());
        player.style.display = 'none'
        takePictureButton.style.display = 'inline-block';
        captureButton.style.display = 'none';
    }
}

function clearPreview(){
    const canvas = document.getElementById('preview-canvas');
    canvas.style.display = 'none';
}