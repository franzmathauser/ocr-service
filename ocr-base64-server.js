/*###########################################
 #       M A S T E R T H E S I S            #
 #                                          #
 # Franz Mathauser                          #
 # Hochschule München                       #
 #                                          #
 ##########################################*/

/**
* Define Variables
**/
var formidable = require('formidable'),
    http = require('http'),
    sys = require('sys'),
    tmp = require('tmp'), 
    nodecr = require('nodecr'), 
    fs = require('fs');

/**
* Header configuration for Cross-Origin Policy.
**/
var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    headers["Content-Type"] = "text/html";
    headers["charset"] = "utf-8"

/**
* Setup Server
**/
http.createServer(function(req, res) {
  
  // respond to the /base64upload ressourcce request
  if (req.url == '/base64upload' && req.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

      // create temp-file
      tmp.tmpName(function(err, tmpFile) {
        console.log(tmpFile);
        // extract meta-data from base64-encoded file.
        var base64Data = fields.image.replace(/^data:image\/png;base64,/,"");
        //write file to disc.
        fs.writeFile(tmpFile, base64Data, 'base64', function(err) {
          doBankFormOCR(tmpFile, res);
        });

      });

    })
    return;
  }

  // default response
  res.writeHead(200, headers);
  res.end('no base64 file found');

}).listen(8888);
console.log('listen on port 8888');


/**
* doBankFormOCR provides a simple method the ocr-decode a image. 
* This method calls the tesseract-ocr-engine and returns the read information as json.
**/
function doBankFormOCR(filePath, res) {

  console.log(filePath);
  
    // do ocr processing using tesseract
    nodecr.process(filePath,function(err, text) {

      if(err) {
          res.writeHead(500,headers);
          res.end('A Error occured during OCR-Process.');
      } else {

        //parse string on newlines.
        var textArray = []; 
        var i = 0;
        var line = 0;
        while (i < text.length)
        {
            var j = text.indexOf("\n", i);
            if (j == -1) j = text.length;
              console.log(text.substr(i, j-i));
              textArray[line++] = text.substr(i, j-i);
            i = j+1;
        }

        console.log(textArray);

        // create response object.
        var responseBodyObj = {
          version:"1.0",
          success:true,
          bodyData: {
            name : textArray[0],
            accountNumber : textArray[1],
            bankName : textArray[2],
            bankCode : textArray[3],
            amount : textArray[4],
            purpose1 : textArray[5],
            purpose2 : textArray[6]
          }
        };

        console.log(responseBodyObj);

        //return response object as json
        res.writeHead(200,headers);
        res.end(JSON.stringify(responseBodyObj));

      }

      console.log("ocr-server: Deleting '"+filePath+"'");
      fs.unlink(filePath, function (err) { // delete temp-file
          // ignore any errors here as it just means we have a temporary file left somewehere
      });

  }, 'deu',6);

}