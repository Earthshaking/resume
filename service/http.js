// node.js 搭建本地 WEB服务器

const PORT = 8888;  // 端口号

var http = require('http');
var url = require('url');
var fs = require('fs');
var mine = require('./mine').types;
var path = require('path');  // 路径模块

// 创建服务
var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    
    // 设置项目文件名称 E:\Static Project\resume
    var realPath = path.join("E:/Static Project/resume", pathname);
    
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.exists(realPath, function (exists) {
        if (!exists) {
            
            // 404错误
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("ERROR:404, " + pathname + " was not found on this server.");
            console.log('错误:404, 此服务器上找不到 http://localhost:' + PORT + '/' + pathname);
            response.end();
            
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
});

// 监听端口号
server.listen(PORT, '0.0.0.0');
console.log('http://192.168.0.100:' + PORT + '/index.html');

// console.log('http://localhost:' + PORT + '/pages/works/index.html');
