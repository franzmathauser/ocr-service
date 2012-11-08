var formidable = require('formidable'),
    http = require('http'),
    sys = require('sys'),
    tmp = require('tmp'), 
    nodecr = require('nodecr'), 
    fs = require('fs');

http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      //res.writeHead(200, {'content-type': 'text/plain'});
      //res.write('received upload:\n\n');
      //res.end(sys.inspect({fields: fields, files: files}));
      doOCR(files.upload.path, res);

    });
    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload" multiple="multiple"> '+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8888);

function doOCR(filePath, res) {

  console.log(filePath);
  
    // do ocr processing using tesseract
    nodecr.process(filePath,function(err, text) {

      // write HTTP-Response
      if(err) {
          res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});
      res.end('A Error occured during OCR-Process.');
      } else {
        
          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
      //res.write('<img src="'+url_parts.query.url+'" /> <br />');
      console.log(text);
      res.end(text);
      }

      console.log("ocr-server: Deleting '"+filePath+"'");
      fs.unlink(filePath, function (err) {
          // ignore any errors here as it just means we have a temporary file left somewehere
      });

      

  }, 'deu',6);

}