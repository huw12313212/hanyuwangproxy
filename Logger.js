var fs = require('fs');

var Logger = {};

module.exports = Logger;

Logger.log = function(str,file)
{
  console.log(str);

  fs.appendFile(file, str+"\n", function (err) {
    if (err) 
      {
        console.log("Logger Error");
        throw err;
      }
  });
}