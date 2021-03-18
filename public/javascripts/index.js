let name = null;
let roomNo = null;
let socket=null;
let chat= io.connect('/chat');

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    initChatSocket();
    initDatabase();
    initWebRTC();
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('room_no').value = 'R' + roomNo;

    //form validation
    var name = document.getElementById("name");
    if(name.value) {
        document.getElementById("connect_btn").disabled = false;
        document.getElementById("valid_form_help").style.display = "none";
    }
}

/**
 * it initialises the socket for /chat
 */

function initChatSocket() {
    // called when someone joins the room. If it is someone else it notifies the joining of the room
    chat.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    chat.on('chat', function (room, userId, chatText) {
        let time = new Date().toLocaleTimeString('en-US', { hour12: false,
            hour: "numeric",
            minute: "numeric"});
        let who = userId
        if (userId === name) who = 'Me';
        if (chatText !== "" && chatText!== null)
            writeOnHistory('<b>' + who + ':</b> ' + chatText + '<br/><small class="form-text text-muted"> ' + time+ '<small>');
    });

}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    //send the chat message
    chat.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('room_no').value;
    name = document.getElementById('name').value;
    let imageUrl= document.getElementById('image_url').value;
    if (!name) name = 'Unknown-' + Math.random();
    // join the room
    chat.emit('create or join', roomNo, name);
    hideLoginInterface(roomNo, name);
    loadImageUrl(roomNo, imageUrl, false).then(imageUrl => initCanvas(socket, imageUrl));
}

function validateForm() {
    let name = document.forms["initial_form"]["name"].value;
    let roomNo= document.forms["initial_form"]["roomNo"].value;
    if (name  ==="" || roomNo ==="") {
        document.getElementById("connect_btn").disabled = true;
        document.getElementById("valid_form_help").style.display = "block";
    }
    else{
        document.getElementById("connect_btn").disabled = false;
        document.getElementById("valid_form_help").style.display = "none";
    }
}
function pressed(e) {
    let key = e.keyCode || e.which;
    if (key === 13){
        console.log("Enter");
        document.getElementById("chat_send").click();
        e.preventDefault();
    }
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}
function submitUrl(){
    imageUrl = document.getElementById('image_url');
    console.log(imageUrl.textContent, imageUrl.innerText, imageUrl.value);
    let canvas = document.getElementById('preview-canvas');
    let context = canvas.getContext('2d');
    let img = new Image();
    img.src = imageUrl.value;
    img.onload = function() {
        var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        // get the top left position of the image
        var x = (canvas.width / 2) - (img.width / 2) * scale;
        var y = (canvas.height / 2) - (img.height / 2) * scale;
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
        canvas.style.display= 'block';
    }
}
function hideImageUrlInput(){
    imageUrl = document.getElementById('image_url');
    let submitImageUrl = document.getElementById('submit-image-url');
    if(imageUrl.style.display !== 'none'){
        imageUrl.style.display = 'none';
        submitImageUrl.style.display = 'none';
    }
}
function showImageUrlInput(){
    imageUrl = document.getElementById('image_url');
    submitImageUrl = document.getElementById('submit-image-url');
    if(imageUrl.style.display !== 'block'){
        stopImageCapture();
        imageUrl.value = '';
        imageUrl.style.display = 'block';
        submitImageUrl.style.display = 'block';
    }
}

/**
 * given a room, it queries the provided URL via Ajax to get the image via GET
 * if the request fails, it shows the data stored in the database
 * @param room
 * @param imageUrl
 * @param forceReload true if the data is to be retrieved from the server
 */
 async function loadImageUrl(room, imageUrl, forceReload){
    // there is no point in retrieving the data from the db if force reload is true:
    // we should not do the following operation if forceReload is true
    // there is room for improvement in this code

    let cachedData = await getCachedData(room);
    if (!forceReload && cachedData) {
        console.log(cachedData);
        const blob = cachedData.image;
        const URLCreator = window.URL || window.webkitURL;
        imageUrl = URLCreator.createObjectURL(blob);
        return imageUrl
    } 
    const xhr = new XMLHttpRequest();
    xhr.open("GET", imageUrl, true);
    // Set the responseType to blob
    xhr.responseType = "blob";
    xhr.addEventListener("load", function () {
        if (xhr.status === 200) {
            console.log("Image retrieved");
            // Blob as response
            const blob = xhr.response;
            // Put the received blob into IndexedDB
            storeCachedData(room, blob)
        }
    }, false);
    // Send XHR
    xhr.send();

    return imageUrl;
}
