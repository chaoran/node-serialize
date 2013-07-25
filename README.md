Serialize
==============

A simple node utility to serialize execution of asynchronous functions.

## What does it do?

Asynchrony in nodejs is great, except that it makes your code looks horrible because of all the callbacks. If you use synchronous functions, which give you good-looking, easy-to-read code, they will block the thread and make your server not responsive.

Here's `serailize` to the rescue! `serialize` converts your asynchronous functions into serialized versions. Serialized functions are executed one after another, without explicitly chaining them with callback functions. `serialize` does __NOT__ execute the function synchronously (block the thread), it just serialize the execution of asynchronous functions. So that it makes the code looks synchronous, but it is actually ascynhronous underneath.

## How to use it?

To create a serialized version of an asynchronous function, call `serialize` with it. For example, if you want to make serialized versions of `fs.writeFile` and `fs.mkdir`, you do:
```javascript
var serialize = require('serialize');

fs.mkdir = serialize(fs.mkdir);
fs.writeFile = serialize(fs.writeFile);
```
Then, you can use `fs.mkdir` and `fs.writeFile` like they are synchronous functions:
```javascript
fs.mkdir('new');
fs.mkdir('new/folder');
fs.writeFile('new/folder/hello.txt', "hello world", callback);
```
These function will be executed one after another, but they will not block the thread as their synchronous versions do. The `callback` will be invoked after the last call completes.

If you want to restore `fs.writeFile` and `fs.mkdir` to their original version, just do:
```javascript
fs.mkdir = fs.mkdir.free();
fs.writeFile = fs.writeFile.free();
```

### What if an error happens? 

If an error happens, the error will be passed to the corresponding callback function, and the execution of all serialized calls after it will be aborted. If an error happens in a function call that does not have a callback, the error will be passed down to the first call that has a callback function. 
For example, if the `fs.mkdir('new')` call in the above code throws an error, because there's no callback attached to that call, the error will be passed down to the callback of `fs.writeFile(...)`. And, of course, `fs.mkdir('new/folder')` and `fs.writeFile(...)` won't be executed because an error occurred before them.

### What's more to it?

If you want to serialize calls to file system, and serialize calls to database, but allow calls to file system and calls to database to happen concurrently, how to do it? 
You can serialize different functions into different queues. Functions belong to the same queue will be executed in serial, but functions between different queues can run concurrently. 
To serialize a function to a queue other than the default queue, give a queue name as the second argument of `serialize`:
```javascript
conn.query = serialize(conn.query, "db");
```

### Is any function *serializable*?

Current version of `serialize` can only serialize a function that satisfies the following conditions:

1. It accepts a callback function, and invokes the callback when it is done;
2. If an error occurs, it must invoke callback with the error as the first argument; the error must be an instance of `Error`.

Note: Future version of `serialize` may be able to serialize a function that emits `end` and `error` events.

## License - MIT

Copyright (c) 2013 Chaoran Yang (chaoran@rice.edu)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
