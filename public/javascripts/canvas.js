/**
 * this file contains the functions to control the drawing on the canvas
 */
let color = 'red', thickness = 4;

/**
 * it inits the image canvas to draw on. It sets up the events to respond to (click, mouse on, etc.)
 * it is also the place where the data should be sent  via socket.io
 * @param sckt the open socket to register events on
 * @param imageUrl teh image url to download
 */
function initCanvas(sckt, imageUrl, room, userId) {
    console.log('socket', sckt);
    socket = sckt;

    let flag = false,
        prevX, prevY, currX, currY = 0;
    let canvas = $('#canvas');
    let cvx = document.getElementById('canvas');
    let img = document.getElementById('image');
    let ctx = cvx.getContext('2d');
    img.src = imageUrl;

    // let w = canvas.width;
    // let h = canvas.height;
    //
    // window.addEventListener('resize', function() {
    //     canvas.width = w;
    //     canvas.height = h;
    // });

    // event on the canvas when the mouse is on it
    canvas.on('mousemove mousedown mouseup mouseout', function (e) {
        let absolutePosition = getAbsoluteCoordinates();
        prevX = currX;
        prevY = currY;
        currX = e.clientX - absolutePosition[0];
        currY = e.clientY - absolutePosition[1];
        if (e.type === 'mousedown') {
            flag = true;
        }
        if (e.type === 'mouseup' || e.type === 'mouseout') {
            flag = false;
        }
        // if the flag is up, the movement of the mouse draws on the canvas
        if (e.type === 'mousemove') {
            if (flag) {
                drawOnCanvas(ctx, canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness);
                // when user draws on the canvas, let everyone know via socket.io
                socket.emit('draw', setData(room, userId, ctx, canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness)
                )};
        }
    });

    // this is code to  provide a button clearing the canvas (it is suggested that you implement it)
    $('#canvas_clear').on('click', function (e) {
        console.log("cleared");
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        //update canvas for all users via socket.io
        setData(room, userId, ctx, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness);
    });

    //capture the event on the socket when someone else is drawing on their canvas
    socket.on('draw', function(data) {
        let ctx = canvas[0].getContext('2d');
        drawOnCanvas(ctx, data.canvasWidth, data.canvasHeight, data.prevX, data.prevY, data.currX, data.currY, data.color, data.thickness)
    });

    // this is called when the src of the image is loaded
    // this is an async operation as it may take time
    img.addEventListener('load', () => {
        // it takes time before the image size is computed and made available
        // here we wait until the height is set, then we resize the canvas based on the size of the image
        let poll = setInterval(function () {
            if (img.naturalHeight) {
                clearInterval(poll);
                // resize the canvas
                let ratioX=1;
                let ratioY=1;
                // if the screen is smaller than the img size we have to reduce the image to fit
                if (img.clientWidth>window.innerWidth)
                    ratioX=window.innerWidth/img.clientWidth;
                if (img.clientHeight> window.innerHeight)
                    ratioY= img.clientHeight/window.innerHeight;
                let ratio= Math.min(ratioX, ratioY);
                // resize the canvas to fit the screen and the image
                cvx.width = canvas.width = img.clientWidth*ratio;
                cvx.height = canvas.height = img.clientHeight*ratio;
                // draw the image onto the canvas
                drawImageScaled(img, cvx, ctx);
                // hide the image element as it is not needed
                img.style.display = 'none';
            }
        }, 10);
    });
}
/**
 * called when it is required to set data object which is later send to socket.io
 * @param ctx the canvas context
 * @param canvasWidth the originating canvas width
 * @param canvasHeight the originating canvas height
 * @param prevX the starting X coordinate
 * @param prevY the starting Y coordinate
 * @param currX the ending X coordinate
 * @param currY the ending Y coordinate
 * @param color of the line
 * @param thickness of the line
 * @return data
 */
function setData(room, userId, ctx, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness){
    let data = {
        room: room,
        userId: userId,
        ctx: ctx,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        prevX: prevX,
        prevY: prevY,
        currX: currX,
        currY: currY,
        color: color,
        thickness: thickness,
    }
    return data;
}

/**
 * called when it is required to draw the image on the canvas. We have resized the canvas to the same image size
 * so it is simpler to draw later
 * @param img
 * @param canvas
 * @param ctx
 */
function drawImageScaled(img, canvas, ctx) {
    // get the scale
    let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x = (canvas.width / 2) - (img.width / 2) * scale;
    let y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

/**
 * this is called when we want to display what we (or any other connected via socket.io) draws on the canvas
 * note that as the remote provider can have a different canvas size (e.g. their browser window is larger)
 * we have to know what their canvas size is so to map the coordinates
 * @param ctx the canvas context
 * @param canvasWidth the originating canvas width
 * @param canvasHeight the originating canvas height
 * @param prevX the starting X coordinate
 * @param prevY the starting Y coordinate
 * @param currX the ending X coordinate
 * @param currY the ending Y coordinate
 * @param color of the line
 * @param thickness of the line
 */
function drawOnCanvas(ctx, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness) {

    //get the ration between the current canvas and the one it has been used to draw on the other computer
    let ratioX= canvas.width/canvasWidth;
    let ratioY= canvas.height/canvasHeight;
    // update the value of the points to draw
    prevX*=ratioX;
    prevY*=ratioY;
    currX*=ratioX;
    currY*=ratioY;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.closePath();
}

function getAbsoluteCoordinates(){
    // use .getBoundingClientRect() instead of .position() to enable correct drawings when page is resized.
    return [canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top];
}