const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const { Twilio } = require('twilio');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const accountSid = 'your_twilio_account_sid'; // Replace with your Account SID
const authToken = 'your_twilio_auth_token';   // Replace with your Auth Token
const client = new Twilio(accountSid, authToken);

app.use(bodyParser.urlencoded({ extended: false }));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('answerCall', (callSid) => {
    client.calls(callSid)
      .update({ url: 'http://your-server-url/answer', method: 'POST' }) // Replace with your server URL
      .then((call) => {
        socket.emit('callAnswered', call.sid);
      })
      .catch((error) => {
        socket.emit('error', error.message);
      });
  });

  socket.on('rejectCall', (callSid) => {
    client.calls(callSid)
      .update({ status: 'completed' })
      .then((call) => {
        socket.emit('callRejected', call.sid);
      })
      .catch((error) => {
        socket.emit('error', error.message);
      });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/handle-gather', (req, res) => {
  const callSid = req.body.CallSid;
  const digits = req.body.Digits;
  
  if (digits === '1') {
    // Notify the dashboard about the incoming call
    io.emit('incomingCall', { callSid });
  } else {
    const response = new Twilio.twiml.VoiceResponse();
    response.say('Call rejected. Goodbye!');
    response.hangup();
    res.type('text/xml');
    return res.send(response.toString());
  }

  res.sendStatus(200);
});

app.post('/answer', (req, res) => {
  const response = new Twilio.twiml.VoiceResponse();
  response.say('You are now connected.');
  // You can add <Dial> here to forward the call if needed
  res.type('text/xml');
  res.send(response.toString());
});


