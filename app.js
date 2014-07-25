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

  console.log("Connected : "+socket.name);
 
  socket.on('data', function (data) {

      console.log(socket.name +":"+data);

      var datas = data.toString().split("\n");

      datas.forEach(function(data)
      {

        if(data.length < 2) return;
       var json;
      try
      {
        json = JSON.parse(data);
      }
      catch(err)
      {
        console.log("[Error]"+socket.name+" sent non json data:"+data);
        return;
      }

    if(socket.proxy != true)
    {


      if(json.command == "CreateProxyServer")
      {
        socket.id = json.id;
        socket.proxy = true;
        socket.isServer = true;
        socket.clients = [];
        console.log("Add Server \""+socket.id+"\"");
        servers[socket.id.toString()]=socket;
      }
      else if(json.command == "ProxyToTarget")
      {
        try
        {
        socket.id = json.id;
        socket.proxy = true;
        socket.isClient = true;
        socket.targetID = json.targetID;
        socket.server = servers[socket.targetID.toString()];

        socket.server.clients.push(socket);

        var command={};
        command.proxyCommand = "ProxyConnected";
        command.connectID = json.id;

          socket.server.write(JSON.stringify(command)+"\n");
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
      var command={};
      command.proxyCommand = "ReceiveFrom";
      command.connectID = socket.id;
      command.data = json;

      console.log("write to Server:"+JSON.stringify(command));
      socket.server.write(JSON.stringify(command)+"\n");
    }
    else if(socket.isServer)
    {
      if(json.proxyCommand == "broadcast")
      {
          socket.clients.forEach(function (client)
          {
            client.write(JSON.stringify(json.data)+"\n");
          });
      }
      else if(json.proxyCommand == "sendTo")
      {
          socket.clients[parseInt(json.index)].write(JSON.stringify(json.data)+"\n");
      }
    }
    else
    {
      console.log("[Error] Weird Command");
    }


      });

    

  });
 
  socket.on('end', function () {

    console.log("Disconnected : "+socket.name);

    if(socket.isServer)
    {
      socket.clients.forEach(function (client)
      {
        client.destroy();
      });
       delete servers[socket.id];

       console.log("servers:"+servers);
    }

    if(socket.isClient)
    {
      var index = socket.server.clients.indexOf(socket);
     if (index > -1) 
     {
      socket.server.clients.splice(index, 1);
      }
    }


  });
 
}).listen(proxyPort);
 
console.log("Proxy server running at port " + proxyPort);