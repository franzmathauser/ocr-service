Installation
============

npm install nodecr
npm install tmp

Configuration
=============
Install http://code.google.com/p/tesseract-ocr/ (I used: tesseract-ocr-setup-3.01-1.exe)

TESSERACT_HOME=C:\Program Files (x86)\Tesseract-OCR
add %TESSERACT_HOME% to PATH-Variable
add TESSDATA_PREFIX=C:\Program Files (x86)\Tesseract-OCR

You may edit the proxy configuration in File: ocr-server.js