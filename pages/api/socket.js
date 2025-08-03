import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  // Agar socket server pehle se nahi chal raha to usay banayein
  if (!res.socket.server.io) {
    console.log('*First use, starting Socket.IO server...');
    const io = new Server(res.socket.server, {
      path: '/socket.io',
      addTrailingSlash: false
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
