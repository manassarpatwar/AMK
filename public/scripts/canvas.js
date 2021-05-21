class Canvas{
  constructor(socket, imageUrl, roomNo){
    this.socket = socket
    this.imageUrl = imageUrl
    this.roomNo = roomNo

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.background = document.getElementById('image');

    this.drawingBoard = document.getElementById('drawing_board');

    this.canvas.width = window.innerWidth*0.25;
    this.canvas.height = window.innerHeight*0.25;
    this.color = 'red';
    this.thickness = 4;

    this.background.style.width = null;
    this.background.style.height = null;
    this.background.src = imageUrl;
    const loadImageUrl = this.loadImageUrl.bind(this);
    this.background.onload = function(){loadImageUrl(this)};

    this.interacting = false;
    this.prev = {x: 0, y: 0}
    this.curr = {x: 0, y: 0}
    this.canvas.addEventListener('mousedown', e => {this.startDraw(e)});
    this.canvas.addEventListener('touchstart', e => {this.startDraw(e)});
    this.canvas.addEventListener('mouseup', e => {this.endDraw(e)});
    this.canvas.addEventListener('touchend', e => {this.endDraw(e)});
    this.canvas.addEventListener('mousemove', e => {this.draw(e)});
    this.canvas.addEventListener('touchmove', e => {this.draw(e)});

    $('#canvas_clear').on('click', e => {
      this.socket.emit('clear', this.roomNo);
      this.clear(e)
    })

    const getScaledCoordinates = this.getScaledCoordinates.bind(this);
    const drawStroke = this.drawStroke.bind(this);

    getCachedData(roomNo).then(cachedData => {
      if(cachedData && cachedData.annotations && cachedData.annotations.length > 0){
        for(const annotation of cachedData.annotations){
          for(const stroke of annotation){
            const {scaledPrev, scaledCurr} = getScaledCoordinates(stroke.normPrev, stroke.normCurr);
            drawStroke(scaledPrev, scaledCurr)
          }
        }
      }
    })

    this.strokes = [];

    this.socket.on('draw', function(data){
      const {scaledPrev, scaledCurr} = getScaledCoordinates(data.normPrev, data.normCurr);
      drawStroke(scaledPrev, scaledCurr);
    })

    const clear = this.clear.bind(this);
    this.socket.on('clear', function(data){
      clear();
    })
  }

  getAbsoluteCanvasCoordiates(){
    return {left: this.canvas.getBoundingClientRect().left, top: this.canvas.getBoundingClientRect().top};
  }

  startDraw(e){
    e.preventDefault()
    if(e.touches){ e = e.touches[0]}
    this.interacting = true;
    this.prev = this.curr;
    const abs = this.getAbsoluteCanvasCoordiates()
    this.curr.x = e.clientX - abs.left
    this.curr.y = e.clientY - abs.top
  }

  endDraw(e){
    e.preventDefault()
    this.interacting = false;
    getCachedData(this.roomNo).then(cachedData => {
      const annotations = cachedData.annotations || []
      annotations.push(this.strokes)
      cachedData.annotations = annotations
      updateCachedData(cachedData);
      this.strokes = []
    })
  }


  clear(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    getCachedData(this.roomNo).then(cachedData => {
      cachedData.annotations = []
      updateCachedData(cachedData);
    })
  }

  getNormalizedCoordinates(){
    const normPrev =  {x: this.prev.x/this.canvas.width, y: this.prev.y/this.canvas.height};
    const normCurr =  {x: this.curr.x/this.canvas.width, y: this.curr.y/this.canvas.height};
    return {normPrev, normCurr}
  }

  getScaledCoordinates(prev, curr){
    const scaledPrev =  {x: prev.x*this.canvas.width, y: prev.y*this.canvas.height};
    const scaledCurr =  {x: curr.x*this.canvas.width, y: curr.y*this.canvas.height};
    return {scaledPrev, scaledCurr}
  }

  drawStroke(prev, curr, color=this.color, thickness=this.thickness){
    this.ctx.beginPath();
    this.ctx.moveTo(prev.x, prev.y);
    this.ctx.lineTo(curr.x, curr.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.stroke();
  }

  draw(e){
    e.preventDefault()
    if(e.touches){ e = e.touches[0]}

    this.prev = {x: this.curr.x, y: this.curr.y};
    const abs = this.getAbsoluteCanvasCoordiates()
    this.curr.x = e.clientX - abs.left
    this.curr.y = e.clientY - abs.top

    if(this.interacting){
      this.drawStroke(this.prev, this.curr, this.color, this.thickness);
      // when user draws on the canvas, let everyone know via socket.io
      const {normPrev, normCurr} = this.getNormalizedCoordinates()
      this.socket.emit('draw', {room: this.roomNo, normPrev, normCurr, color: this.color, thickness: this.thickness})
      this.strokes.push({normPrev, normCurr, color: this.color, thickness: this.thickness})
    }

  }

  loadImageUrl(img){
    console.log(img);
    let ratio = {x: 1, y: 1};
    // if the screen is smaller than the img size we have to reduce the image to fit
    if (img.width > window.innerWidth)
      ratio.x = window.innerWidth/img.width;
    if (img.height > window.innerHeight)
      ratio.y = img.height/window.innerHeight;
    ratio = Math.min(ratio.x, ratio.y);
    // resize the canvas to fit the screen and the image
    this.canvas.width = img.width*ratio;
    this.canvas.height = img.height*ratio;

    const scale = Math.max(this.canvas.width /  img.width, this.canvas.height / img.height);
    // get the top left position of the image
    img.style.width = img.width * scale+'px'
    img.style.height = img.height * scale+'px';

    this.drawingBoard.style.width = img.width * scale+'px'
    this.drawingBoard.style.height = img.height * scale+'px'
  }

  updateBackground(imageUrl){
    this.background.style.height = null;
    this.background.src = "";
    this.imageUrl = imageUrl;
    this.background.src = imageUrl;
  }

}