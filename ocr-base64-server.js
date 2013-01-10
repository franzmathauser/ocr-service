var formidable = require('formidable'),
    http = require('http'),
    sys = require('sys'),
    tmp = require('tmp'), 
    nodecr = require('nodecr'), 
    fs = require('fs');

var headers = {};
      // IE8 does not allow domains to be specified, just the *
      // headers["Access-Control-Allow-Origin"] = req.headers.origin;
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
      headers["Content-Type"] = "text/html";
      headers["charset"] = "utf-8"

http.createServer(function(req, res) {
      
if (req.url == '/base64upload' && req.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      //console.log(fields.image);

      tmp.tmpName(function(err, output) {
        console.log(output);
        var base64Data = fields.image.replace(/^data:image\/png;base64,/,"");

        fs.writeFile(output, base64Data, 'base64', function(err) {
          //callback 
          doOCR(output, res);
        });

      });
      
    })
    return;
  }

  // show a file upload form
  res.writeHead(200, headers);
  res.end('no base64 file found');

}).listen(8888);
console.log('listen on port 8888');



function doOCR(filePath, res) {

  console.log(filePath);
  
    // do ocr processing using tesseract
    nodecr.process(filePath,function(err, text) {

      // write HTTP-Response
      if(err) {
          res.writeHead(500,headers);
          //console.error("500");
          res.end('A Error occured during OCR-Process.');
      } else {

        res.writeHead(200,headers);

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
        res.end(JSON.stringify(responseBodyObj));

      }

      console.log("ocr-server: Deleting '"+filePath+"'");
      fs.unlink(filePath, function (err) {
          // ignore any errors here as it just means we have a temporary file left somewehere
      });

  }, 'deu',6);

}