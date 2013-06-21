node-serialize
==============

A simple node library to serialize execution of asynchronous functions.

# What does it do?

Nodejs is an non-blocking I/O platform, which means all I/O operations are asynchronous. Asynchrny is great, except that it makes your code looks horrible because of all the callbacks. If you execute an I/O operation synchronously, which gives you good-looking, easy-to-read code, it will block the thread and makes your server not responsive.

Here's node-serailize to the rescue! node-serialize will convert your asynchronous functions into their serailized versions, so that they are executed one after another, without explicitly use callback functions. Please note that node-serialize does not execute the function synchronously (block the thread), it just serialize the execution of asynchronous functions. It makes the code looks synchronous, but it is actually ascynhronous underneath.

# How to use it?

To create a serialized version of an asynchronous function, all you need to do is call `serialize` with it. For example, if you want to make a serialized version of `fs.writeFile` and `fs.mkdir`, you do:
```javascript
var serialize = require('serialize');

fs.mkdir = serialize(fs.mkdir);
fs.writeFile = serialize(fs.writeFile);
```
Then, you can use `fs.mkdir` and `fs.writeFile` like they are synchronous:
```javascript
fs.mkdir('new');
fs.mkdir('new/folder');
fs.writeFile('new/folder/hello.txt', "hello world", callback);
```
These function will be executed one after another, but they will not block the thread like their synchronous versions.

If you want to restore `fs.writeFile` and `fs.mkdir` to their original version, just do:
```javascript
fs.mkdir = fs.mkdir.free();
fs.writeFile = fs.writeFile.free();
```

