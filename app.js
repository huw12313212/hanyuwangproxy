var express = require('express')
	, app = express()
  	, server = require('http').createServer(app);

var Log = require('./Logger.js');
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

  Log.log("[proxy] Connect : "+socket.name,"console.log");
 
  socket.on('data', function (data) {

      console.log(socket.name +":"+data);

      Log.log("[raw data]:"+socket.name +":"+data,"input.log");

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
        Log.log("[error]"+socket.name+" sent non-json data:"+data,"console.log");

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

        Log.log("[uid="+socket.id+ "] Created new server","console.log");

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

          Log.log("[uid="+socket.id+ "] Connect to [uid="+socket.server.id+"]","console.log");

          Log.log("[proxy] Send Notify To Server [uid="+ socket.server.id+"] :"+JSON.stringify(command),"output.log");

          socket.server.write(JSON.stringify(command)+"\n");
        }
        catch(err)
        {

          Log.log("[error] Server not found:\""+json.targetID+"\"","console.log");

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


      Log.log("[proxy] Client [uid="+socket.id+"] send to Server [uid="+socket.server.id+"] "+ JSON.stringify(command),"output.log");

      socket.server.write(JSON.stringify(command)+"\n");
    }
    else if(socket.isServer)
    {
      if(json.proxyCommand == "broadcast")
      {
          socket.clients.forEach(function (client)
          {
            Log.log("[proxy] Server [uid="+socket.id+"] broadcast to Client [uid="+client.id+"] "+ JSON.stringify(json.data),"output.log");

            client.write(JSON.stringify(json.data)+"\n");
          });
      }
      else if(json.proxyCommand == "sendTo")
      {
          Log.log("[proxy] Server [uid="+socket.id+"] send to Client [uid="+ socket.clients[parseInt(json.index)].id+"] "+ JSON.stringify(json.data),"output.log");

          socket.clients[parseInt(json.index)].write(JSON.stringify(json.data)+"\n");
      }
    }
    else
    {
      
          Log.log("[error] Command Not Found "+data,"console.log");
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

       Log.log("[proxy] Server [uid="+socket.id+"] Disconnected.","console.log");

       delete servers[socket.id];

     
    }

    if(socket.isClient)
    {
      var index = socket.server.clients.indexOf(socket);
     if (index > -1) 
     {
      socket.server.clients.splice(index, 1);
      }

      Log.log("[proxy] Client [uid="+socket.id+"] Disconnected.","console.log");
    }

  });
 
}).listen(proxyPort);
 
  Log.log("Proxy server running at port " + proxyPort,"console.log");