serialize
==============

A simple node utility to serialize execution of asynchronous functions.

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
These function will be executed one after another, but they will not block the thread like their synchronous versions. `callback` will be invoked after all three calls complete.

If you want to restore `fs.writeFile` and `fs.mkdir` to their original version, just do:
```javascript
fs.mkdir = fs.mkdir.free();
fs.writeFile = fs.writeFile.free();
```

## What if an error happened? 

If an error happens, it will be passed to the corresponding callback function, and the execution of all serialized calls after it will be aborted. If an error happens in a function call that does not have a callback, the error will be passed down to the first call that has a callback function. 
For example, if the `fs.mkdir('new')` call in the above code throws an error, because there's no callback attached to that call, the error will be passed down to the callback of `fs.writeFile(...)`. And, of course, `fs.mkdir('new/folder')` and `fs.writeFile(...)` won't be executed because an error occurred before them.

## What's more to it?

If you want to serialize calls to file system, and serialize calls to database, but allow calls to file system and calls to database to happen concurrently, how to achieve this? 
Sure! You can serialize different functions into different queues. Functions belong to the same queue will be executed in serial, but functions between different queue can run concurrently. 
To serialize a function to a queue other than the default queue, give a queue name as the second argument of `serialize`:
```javascript
conn.query = serialize(conn.query, "db");
```

## Is any function `serializable`?

Current version of `serialize` can only serialize a function that satisfies the following conditions:
1. It accepts a callback function, and invokes the callback when it is done;
2. If the callback function is optional, the second to last argument cannot be a 'Function' type;
3. If an error occurs, it passed the error as the first argument to the callback, and the error must be an instance of `Error`.

Note: Future version of `serialize` will be able `serialize` a function that emits an `end` or `error` event, instead of using a callback.
