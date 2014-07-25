var fs = require('fs');

var Logger = {};

module.exports = Logger;

Logger.log = function(str)
{
  console.log(str);

  fs.appendFile('log.log', str, function (err) {
    if (err) 
      {
        console.log("Logger Error");
        throw err;
      }
  });

}

Logger.log("test");