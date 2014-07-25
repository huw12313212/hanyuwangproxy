var express = require('express')
	, app = express()
  	, server = require('http').createServer(app);

var port = 5566;
var proxyPort = 5567;

//server
server.listen(port);

//send game index.html
app.use(express.favicon());
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client/hello.html');
});

// Load the TCP Library
net = require('net');
 
// Keep track of the chat clients
var servers = {};

// Start a TCP Server
net.createServer(function (socket) {
 
  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort;

  socket.write("hello world\n");
    socket.write("hello world\n");
      socket.write("hello world\n");
  console.log("Connected : "+socket.name);
 
  socket.on('data', function (data) {

console.log(socket.name +":"+data);

    if(socket.proxy != true)
    {
      try
      {
        var json = JSON.parse(data);
      }
      catch(err)
      {
        console.log("[Error]"+socket.name+" sent non json data:"+data);
        return;
      }


      if(json.command == "CreateProxyServer")
      {
        socket.id = json.id;
        socket.proxy = true;
        socket.isServer = true;
        socket.clients = [];
        console.log("Add Server \""+socket.id+"\"");
        servers["h"]=socket;
      }
      else if(json.command == "ProxyToTarget")
      {
        try
        {
        socket.id = json.id;
        socket.proxy = true;
        socket.isClient = true;
        socket.targetID = json.targetID;
        socket.server = servers["h"];
        }
        catch(err)
        {
          console.log(err);
          console.log("cant find server:\""+json.targetID+"\"");
          socket.destroy();
        }
      }
    }
    else if(socket.isClient)
    {
      socket.server.write(data);
    }
    else if(socket.isServer)
    {
      socket.clients.forEach(function (client)
      {
        client.write(data);
      });
    }
    else
    {
      console.log("[Error] Weird Command");
    }

  });
 
  socket.on('end', function () {

    console.log("Disconnected : "+socket.name);

    if(socket.isServer)
    {
      socket.clients.forEach(function (client)
      {
        client.destroy();
      });
       delete servers[socket];

       console.log("servers:"+servers);
    }


  });
 
}).listen(proxyPort);
 
console.log("Proxy server running at port " + proxyPort);