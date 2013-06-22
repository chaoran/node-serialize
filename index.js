var slice = Array.prototype.slice;
var queues = [];

var WorkQueue = function() {
  this.running = null;
  this.pending = [];
};

WorkQueue.get = function(name) {
  var queue = queues[name];
  if (!queue) queue = queues[name] = new WorkQueue();
  return queue;
};

WorkQueue.prototype.add = function(_this, func, args) {
  var that = this;
  var callback = args.pop();

  if (typeof callback === 'function') {
    args.push(function() {
      callback.apply(this, arguments);
      that.next(arguments[0]);
    });
  } else  {
    args.push(callback);
    args.push(function(err) { that.next(err) });
  }

  var task = function(err) { 
    if (err instanceof Error) args[args.length - 1].call(global, err);
    else func.apply(_this, args);
  };

  if (!this.running) (this.running = task)();
  else this.pending.push(task);
};

WorkQueue.prototype.next = function(err) {
  var run = this.running = this.pending.shift();
  if (run) run(err);
};

var serialize = function(func, name) {
  if (!name) name = 'default';

  var queue = WorkQueue.get(name);
  var serialized = function() {
    queue.add(this, func, slice.call(arguments));
  };

  serialized.free = function() { return func; };
  return serialized;
}

module.exports = serialize;
