export default function handler(req, res) {
  // Check karein ke socket server chal raha hai ya nahi
  if (req.socket.server.io) {
    console.log('Notifying clients...');
    // Sab connected clients ko 'serviceUpdate' ka event bhejein
    req.socket.server.io.emit('serviceUpdate');
    res.status(200).json({ success: true });
  } else {
    console.log('Socket server not found.');
    res.status(500).json({ success: false, message: 'Socket is not initialized' });
  }
}
