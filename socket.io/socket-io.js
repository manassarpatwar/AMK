exports.init = function(io) {

  // the chat namespace
  const chat= io
      .of('/chat')
      .on('connection', function (socket) {
        try {
          /**
           * it creates or joins a room
           */
          socket.on('create or join', function (room, userId) {
            socket.join(room);
            chat.to(room).emit('joined', room, userId);
          });

          socket.on('chat', function (room, userId, chatText) {
            chat.to(room).emit('chat', room, userId, chatText);
          });

          socket.on('draw', function(data) {
              socket.to(data.room).emit('draw', data)
          });

          socket.on('sendUrl', function(room, name, imgTitle, description, url) {
              socket.to(room).emit('sendUrl', room, name, imgTitle, description, url)
          });

          socket.on('clear', function(room) {
              socket.to(room).emit('clear')
          });

          socket.on('disconnect', function(){
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });
}
