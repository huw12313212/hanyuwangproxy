var fs = require('fs');

var Logger = {};

Logger.timestamp = false;

module.exports = Logger;

Logger.log = function(str,file)
{
  console.log(str);

  var data = str;

  if(Logger.timestamp)
  {
  	var time = new Date();
  	data = "["+time.toString()+"]"+data;
  }


  fs.appendFile(file, data+"\n", function (err) {
    if (err) 
      {
        console.log("Logger Error");
        throw err;
      }
  });
}