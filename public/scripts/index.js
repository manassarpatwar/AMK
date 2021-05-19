
let name = null;
let roomNo = null;
let socket = null;
let canvas = null;
let chat= io.connect('/chat');




/**
 * called by <body onload>
 * it initialises the interface,the expected socket messages, WebRTC, Database
 * declares the service worker
 * @param room: room
 * @param user: username
 */
function init(room, user) {
    // it sets up the interface so that userId and room are selected
    scrollBottom(1000);
    initChatSocket();
    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    initWebRTC();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() {
                console.log('ServiceWorker registration successful with scope:');
            }, function(err) {
                // registration failed
                console.log('ServiceWorker registration failed: ', err);
            });
    }

    //it connects to a room when someone opens the link or refreshes the page (init for chat.ejs)
    if (typeof room !== 'undefined' && typeof user !=='undefined'){
        connectToRoom(room, user);
        getCachedData(room).then(cachedData => {
            if(cachedData && cachedData.history){
                cachedData.history.forEach(entry => writeOnHistory(formatChatText(entry)));
            }
        })
    }

    $('#close_swap_alert').on('click', () => $('#swap_alert').addClass('d-none'))
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
                if(cachedData){
                    const history = cachedData.history || [];
                    history.push({who, chatText, time});
                    cachedData.history = history;
                    updateCachedData(cachedData);
                }
            })
        }
    });

}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via socket
 */
function sendChatText() {
    scrollBottom(50);
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
        if(!cachedData){
            cachedData = {};
            storeCachedData(roomNo, cachedData)
        }
        const base64 = cachedData.image ? cachedData.image.base64 : null;
        canvas = new Canvas(chat, base64, roomNo);
    });
}

function createRoom() {
    const anonymous = document.getElementById('checkAnonymous');
    // first is saves the images and data in the database and then it moves to different route
    roomNo = document.getElementById('room_no').value;
    name = document.getElementById('name').value
    let title = document.getElementById('img_title').value + ".png";
    let description = document.getElementById('description').value
    if (!(name) && anonymous.checked) name = 'Anonymous' + parseInt((Math.random()*1000),10);
    const imageBase64 = document.getElementById('image_base_64');
    const image = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};

    let img = {
        title: title,
        author: name,
        description: description,
        data: imageBase64.value.split(',')[1]
    }

    storeCachedData(roomNo, {image}, () => sendAjaxQuery('/save', img, roomNo, name));

}

/**
 * used to validate whether all required fields are present (user and room number)
 *
 */
function validateForm() {
    let name = document.getElementById('name').value;
    let roomNo= document.getElementById('room_no').value
    const anonymous = document.getElementById('checkAnonymous');
    let canvas_style = document.getElementById('preview_canvas').style.display;
    if (anonymous.checked){
        document.getElementById('name').value = "";
    }
    if (roomNo  ==="" || (name ==="" && !anonymous.checked) || canvas_style === "none") {
        document.getElementById("connect_btn").disabled = true;
        document.getElementById("valid_form_help").style.display = "block";
    }
    else{
        document.getElementById("connect_btn").disabled = false;
        document.getElementById("valid_form_help").style.display = "none";
    }
}

function sendAjaxQuery(url, data, room, name) {
    console.log("send")
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            let ret = dataR;
            // in order to have the object printed by alert
            // we need to JSON stringify the object
            // document.getElementById('results').innerHTML= JSON.stringify(ret);
            console.log(ret);
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }

    });
    location.assign('/chat/'+room+'/'+name);
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

function clearHistory(){
    const history = document.getElementById('history');
    history.innerHTML = "";
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
    const imageBase64 = document.getElementById('image_base_64');
    const imageUrl = document.getElementById('image_url');
    console.log(imageUrl.textContent, imageUrl.innerText, imageUrl.value);
  
    
    $.ajax({
        url: imageUrl.value,
        cache: false,
        xhrFields:{
            responseType: 'blob'
        },
        success: function(blob){
            convertToBase64(blob).then(data => {
                const base64 = data.result;
                console.log(base64);
                imageBase64.value = base64;
                imageBase64.setAttribute("url", imageUrl.value);
                preview(base64);
            });
        },
        error:function(){
            
        }
    });
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
/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}