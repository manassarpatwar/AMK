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
              chat.to(data.room).emit('draw', data)
          });

          socket.on('sendUrl', function(room, url) {
                chat.to(room).emit('sendUrl', url)
            });

          socket.on('clear', function(room, canvas) {
            chat.to(room).emit('clear', canvas)
          });

     /*   socket.on('sendUrl', function(room, url) {
            chat.to(room).emit('clear', url)
        });*/

          socket.on('disconnect', function(){
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });
}
