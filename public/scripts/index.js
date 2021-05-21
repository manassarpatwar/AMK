
let name = null;
let roomNo = null;
let socket = null;
let canvas = null;
let imgTitle = null;
let description = null;
let chat= io.connect('/chat');
let getFromMongo = false;

const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';



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
            .register('/service-worker.js')
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
        if(cachedData.image){
            canvas = new Canvas(chat, cachedData.image.base64, roomNo);
        }else{
            getImage(room).then(function(data){
                canvas = new Canvas(chat, data['base64'], roomNo);
                console.log("hello")
            })
        }
    });
}

async function createRoom() {
    const anonymous = document.getElementById('checkAnonymous');
    // first is saves the images and data in the database and then it moves to different route
    roomNo = document.getElementById('room_no').value;
    name = document.getElementById('name').value;
    let rooms = await getRooms();

    let img;
    if (document.getElementById('joinRoom').style.display==='none') {
        if (rooms.includes(roomNo)){
            document.getElementById("existing_room").style.display = "block";
        }
        else {
            imgTitle = document.getElementById('img_title').value;
            description = document.getElementById('description').value;
            if (!(name) && anonymous.checked) name = 'Anonymous' + parseInt((Math.random() * 1000), 10);
            const imageBase64 = document.getElementById('image_base_64');
            const image = {url: imageBase64.getAttribute("url"), base64: imageBase64.value};
            img = {
                roomNo: roomNo,
                title: imgTitle,
                author: name,
                description: description,
                data: imageBase64.value.split(',')[1]
            }
            storeCachedData(roomNo, {image, title: imgTitle, description: description}, () => sendImage(img).then(() => location.assign('/chat/'+roomNo+'/'+name)));
        }
    }
    else {

        if (rooms.includes(roomNo)){
            img = null;
            location.assign('/chat/'+roomNo+'/'+name);
        }
        else {
            document.getElementById("new_room").style.display = "block";
        }
    }
}

/**
 * used to validate whether all required fields are present
 *
 */
function validateFormCreate() {
    let name = document.getElementById('name').value;
    let roomNo= document.getElementById('room_no').value
    const anonymous = document.getElementById('checkAnonymous');
    let canvas_style = document.getElementById('preview_canvas').style.display;
    let imgTitle = document.getElementById('img_title').value ;
    let description = document.getElementById('description').value;
    if (anonymous.checked){
        document.getElementById('name').value = "";
    }

    // validate the image name
    let valid_title = true;
    if (imgTitle === "" || (/[<">\/*?:|]+/.test(imgTitle)))
        valid_title = false;

    if (roomNo  === "" || (name === "" && !anonymous.checked) || canvas_style === "none" || !valid_title || description === "") {
        document.getElementById("connect_btn").disabled = true;
        document.getElementById("valid_form_help").style.display = "block";
        if (!valid_title)
            document.getElementById("valid_form_image_name").style.display = "block";
    }
    else{
        document.getElementById("connect_btn").disabled = false;
        document.getElementById("valid_form_help").style.display = "none";
        document.getElementById("valid_form_image_name").style.display = "none";
    }
}

function validateForm(){
    if (document.getElementById('joinRoom').style.display==='block')
        validateFormJoin();
    else if (document.getElementById('joinRoom').style.display==='none')
        validateFormCreate();
}

/**
 * used to validate whether all required fields are present
 *
 */
function validateFormJoin(){
    let name = document.getElementById('name').value;
    let roomNo= document.getElementById('room_no').value
    const anonymous = document.getElementById('checkAnonymous');
    if (anonymous.checked){
        document.getElementById('name').value = "";
    }
    if (roomNo  === "" || (name === "" && !anonymous.checked)) {
        document.getElementById("connect_btn").disabled = true;
    }
    else {
        document.getElementById("connect_btn").disabled = false;
    }
}

/**
 * displays the image chosen from the database
 * @returns {Promise<void>}
 */
async function showImage(){
    let select = document.getElementById("select_img");
    let id= select.value;
    let image = await getImage(id, true);
    const imageBase64 = document.getElementById('image_base_64');
    imageBase64.value = image.base64;
    preview(image.base64);

}

async function chooseImages(){
    if (!getFromMongo) {
        let images = await getImages();
        let select = document.getElementById("select_img");
        if (images.length === 0){
            select.style.display = "none";
            document.getElementById("database_images").innerText = "No one uploaded any images yet.";
            document.getElementById("submit_image").disabled = true;
        }
        else {
            for (let img of images) {
                let option = document.createElement("option");
                option.text = img["title"];
                option.value = img["_id"];
                select.appendChild(option);
            }
            getFromMongo = true;
        }

    }
}

/**
 * sends post request to save file locally and store the path and the details of
 * the uploaded image in the MongoDB
 *
 */
function sendImage(imageData) {
    return new Promise(function(resolve, reject){
        $.ajax({
            url: '/save',
            data: imageData,
            type: 'POST',
            success: function (data) {
                resolve(data)
                console.log("saved")
            },
            error: function (xhr, status, error) {
                reject({'error': error.message});
                console.log("failure")
            }
        });
    })
}

function getImages(){
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/images',
            type: 'GET',
            success: function (data) {
                resolve(data)
            },
            error: function (xhr, status, error) {
                reject('Error: ' + error.message);
            }
        });
    });
}

function getImage(param, byId=false){
    let url = "";
    if (!byId){
        url = '/imageByRoom/'+ param
    }
    else
        url = '/imageById/'+ param
    return new Promise(function(resolve, reject){
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                resolve(data)
            },
            error: function (xhr, status, error) {
                reject({'error: ': error.message});
            }
        });
    })
}


function getRooms(){
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/rooms',
            type: 'GET',
            success: function (data) {
                resolve(data);
            },
            error: function (xhr, status, error) {
                reject('Error: ' + error.message);
            }
        });
    });
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
    //console.log(imageUrl.textContent, imageUrl.innerText, imageUrl.value);

    $.ajax({
        url: imageUrl.value,
        cache: false,
        xhrFields:{
            responseType: 'blob'
        },
        success: function(blob){
            convertToBase64(blob).then(data => {
                const base64 = data.result;
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
    const imageBase64 = document.getElementById('image_base_64');

    getCachedData(roomNo).then(cachedData => {
        if(cachedData){
            const title = cachedData.title
            const description = cachedData.description
            let img = {
                roomNo: roomNo,
                title: title,
                author: name,
                description: description,
                data: imageBase64.value.split(',')[1]
            }
            sendImage(img)
        }
    });
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

function createRoomShow(){
    document.getElementById('formJoinCreate').style.display='block';
    document.getElementById('createRoom').style.display='block';
    document.getElementById('joinRoom').style.display='none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('textJoin').style.display='none';
    document.getElementById('textCreate').style.display='block';
    document.getElementById('room_no_generator').style.display = 'inline-block';
    document.getElementById('room_no').style.maxWidth = 'calc(100% - 95px)';
    window.scrollTo(0,0);
}

function joinRoomShow(){
    document.getElementById('textJoin').style.display='block';
    document.getElementById('textCreate').style.display='none';
    document.getElementById('formJoinCreate').style.display='block';
    document.getElementById('createRoom').style.display='none';
    document.getElementById('joinRoom').style.display='block';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('room_no_generator').style.display = 'none';
    document.getElementById('room_no').style.maxWidth = 'none';
    window.scrollTo(0,0);
}


/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('typeSet').innerHTML= 'of type: '+type;
        document.getElementById('widget').style.display='block';
        document.getElementById('typeForm').style.display= 'none';
        document.getElementById('adjustType').style.display='block';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('typeSet').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}
function adjustType(){
    document.getElementById("myType").value = "";
    document.getElementById("myInput").value = ""
    document.getElementById('widget').style.display='none';
    document.getElementById('typeSet').innerHTML= '';
    document.getElementById('typeForm').style.display= 'block';
    document.getElementById('adjustType').style.display='none';
}
/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    let row = event.row;
    // @todo save row inside indexedDb
    // document.getElementById('resultImage').src= row.json.image.url;
    let results = document.getElementById('resultPanel');
    let result = document.createElement('div');
    result.className = "knowledgeGraphResult"

    let name = document.createElement('h4');
    name.innerText = row.name;
    name.style.textAlign = "center";
    result.appendChild(name);

    let description = document.createElement('p');
    description.innerText = row.rc;
    description.style.textAlign = "justify";
    result.appendChild(description);

    let link = document.createElement("a");
    link.innerText = "See more..."
    link.href = row.qc;
    result.appendChild(link);

    results.appendChild(result);
}

$(function() {
    $('#btnAddtoList').click(function(){

        //newDiv.style.background = "#000";
        $('body').append(newDiv);
    });
});

/**
 * currently not used. left for reference
 * @param id
 * @param type
 */
function queryMainEntity(id, type){
    const  params = {
        'query': mainEntityName,
        'types': type,
        'limit': 10,
        'indent': true,
        'key' : apiKey,
    };
    $.getJSON(service_url + '?callback=?', params, function(response) {
        $.each(response.itemListElement, function (i, element) {

            $('<div>', {text: element['result']['name']}).appendTo(document.body);
        });
    });
}