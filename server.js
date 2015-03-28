var express = require('express');
var app = express();
var expressWs = require('express-ws')(app)

app.use(express.static('.'));

app.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    console.log("Got message", msg);
    ws.send(msg);
  });
});


app.listen(process.env.PORT || 3000);