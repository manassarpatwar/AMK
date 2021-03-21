let name = null;
let roomNo = null;
let socket=null;
let chat= io.connect('/chat');

/**
 * called by <body onload>
 * it initialises the interface,the expected socket messages, WebRTC, Database
 * plus the associated actions
 * @param room: room
 * @param user: username
 */
function init(room, user) {
    // it sets up the interface so that userId and room are selected
    initChatSocket();
    initDatabase();
    initWebRTC();
    //it connects to a room when someone open the link or refresh the page (init for chat.ejs)
    if (typeof room !== 'undefined' && typeof user !=='undefined'){
        connectToRoom(room, user);
        getCachedData(room).then(cachedData => {
            if(cachedData.history){
                cachedData.history.forEach(entry => writeOnHistory(formatChatText(entry)));
            }
        })
    }
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('room_no').value = 'R' + roomNo;

    validateForm()
}

/**
 * it initialises the socket for /chat/:roomNo/:user
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
        if (chatText !== "" && chatText!== null){
            writeOnHistory(formatChatText({who, chatText, time}));
            getCachedData(room).then(cachedData => {
                console.log(cachedData);
                const history = cachedData.history || [];
                history.push({who, chatText, time});
                cachedData.history = history;
                updateCachedData(cachedData);
            })
        }
    });

}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via socket
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
function connectToRoom(room, user) {
    roomNo = room;
    name = user;
    // join the room
    chat.emit('create or join', roomNo, name);
    getCachedData(room).then(cachedData => {
        initCanvas(socket, cachedData.image.base64)
    });
}

function createRoom() {
    const anonymous = document.getElementById('checkAnonymous');
    // first is saves the images and data in the database and then it moves to different route
    roomNo = document.getElementById('room_no').value;
    name = document.getElementById('name').value
    if (!(name) && anonymous.checked) name = 'Anonymous' + parseInt((Math.random()*1000),10);
    const imageBase64 = document.getElementById('image_base_64');
    const image = {url: imageBase64.getAttribute("url"), base64: imageBase64.value}
    storeCachedData(roomNo, {image}, () => location.assign('/chat/'+roomNo+'/'+name));
}

/**
 * used to validate whether all required fields are present (user and room number)
 *
 */
function validateForm() {
    let name = document.getElementById('name').value;
    let roomNo= document.getElementById('room_no').value
    const anonymous = document.getElementById('checkAnonymous');
    if (anonymous.checked){
        document.getElementById('name').value = "";
    }
    if (roomNo  ==="" || (name ==="" && !anonymous.checked)) {
        document.getElementById("connect_btn").disabled = true;
        document.getElementById("valid_form_help").style.display = "block";
    }
    else{
        document.getElementById("connect_btn").disabled = false;
        document.getElementById("valid_form_help").style.display = "none";
    }
}
/**
 * it enables a pressed key 'enter' sends a message
 * @param e: event listener
 */
function pressed(e) {
    let key = e.keyCode || e.which;
    if (key === 13){
        document.getElementById("chat_send").click();
        e.preventDefault();
    }
}

function formatChatText({who, chatText, time}){
    return '<b>' + who + ':</b> ' + chatText + '<br/><small class="form-text text-muted"> ' + time+ '<small>';
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    const history = document.getElementById('history');
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
    if(document.getElementById('initial_form')) {
        document.getElementById('initial_form').style.display = 'none';
    }
    else{
        document.getElementById('chat_interface').style.display = 'block';
        document.getElementById('who_you_are').innerHTML = userId;
        document.getElementById('in_room').innerHTML = ' ' + room;
    }
}

function submitUrl(){
    imageBase64 = document.getElementById('image_base_64');
    imageUrl = document.getElementById('image_url');
    console.log(imageUrl.textContent, imageUrl.innerText, imageUrl.value);
  
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", imageUrl.value, true);
    // Set the responseType to blob
    xhr.responseType = "blob";
    xhr.addEventListener("load", function () {
        if (xhr.status === 200) {
            console.log("Image retrieved");
            // Blob as response
            const blob = xhr.response;
            // Convert blob to base 64
            convertToBase64(blob).then(data => {
                const base64 = data.result;
                console.log(base64);
                imageBase64.value = base64;
                imageBase64.setAttribute("url", imageUrl.value);
                preview(base64);
            });
        }
    }, false);

    // Send XHR
    xhr.send();
}

function hideImageUrlInput(){
    imageUrlGroup = document.getElementById('image_url_group');
    imageUrlGroup.style.display = 'none';
}

function showImageUrlInput(){
    imageUrl = document.getElementById('image_url');
    imageUrlGroup = document.getElementById('image_url_group');
    stopImageCapture();
    clearPreview(imageUrl.value);
    imageUrlGroup.style.display = 'flex';
}

function convertToBase64(blob){
    return new Promise(function(resolve, reject){
        const fileReader = new FileReader();
        fileReader.addEventListener("load", function(e){
            resolve({
                result: e.target.result,
                error: e.target.error,
            })
        });
        fileReader.readAsDataURL(blob);
    })
  
}