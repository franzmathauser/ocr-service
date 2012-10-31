/*
 * Project: Masterthesis
 * OCR-Service for simple bank transfer text extraction
 *
 * Author:  Franz Mathauser
 * Last Change: 2012-10-31
 * Copyright (c): Franz Mathauser, 2012
 */

var nodecr = require('nodecr'),
url = require('url'),
http = require('http'),
fs = require('fs'),
tmp = require('tmp');


http.createServer(function(req,res){

	//receive GET-parameter
	var url_parts = url.parse(req.url,true);

    if(!url_parts.query.url){ // require url to proceed
    	res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
		res.end('No "url"-Parameter found.');
    } else {

		console.log("request-image-url:" + url_parts.query.url);

		var options = {
		  host: "141.77.17.155",
		  port: 8080,
		  path: url_parts.query.url,
		  headers:{}
		};

		//options.path = url_parts.query.url;
		http.get(options, function(imageReq){
		
	    	var imagedata = '';
	    	imageReq.setEncoding('binary');

	    	// callback - receiving image content.
	    	imageReq.on('data', function(chunk){
	    		imagedata += chunk;
	    	})

	    	// callback - done sending image
	    	imageReq.on('end', function(){

	    		tmp.tmpName(function(err, output) {

		    		// write image to fs
		    		fs.writeFile(output,imagedata,'binary', function(err){
		    			if(err) throw err
		    			console.log("ocr-server: Stored '"+output+"'");

		    			// do ocr processing using tesseract
		    			nodecr.process(output,function(err, text) {

		    				// write HTTP-Response
						    if(err) {
						        res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});
								res.end('A Error occured during OCR-Process.');
						    } else {
						    	
						        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
								res.write('<img src="'+url_parts.query.url+'" /> <br />');
								console.log(text);
								res.end(nl2br(text));
						    }

						    console.log("ocr-server: Deleting '"+output+"'");
						    fs.unlink(output, function (err) {
					        	// ignore any errors here as it just means we have a temporary file left somewehere
					        });

						}, 'deu',6);

		    		})
		    	})
	    	})
	    });
	}

    

}).listen(8383, '127.0.0.1');


console.log('Server running at 127.0.0.1:8383');
console.log('usage for example: http://localhost:8383/?url=http://141.77.9.99/test2_1.png');

function nl2br (str, is_xhtml) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Philip Peterson
  // +   improved by: Onno Marsman
  // +   improved by: Atli Þór
  // +   bugfixed by: Onno Marsman
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Maximusya
  // *     example 1: nl2br('Kevin\nvan\nZonneveld');
  // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
  // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
  // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
  // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
  // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

