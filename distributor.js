var observer = require("./observer.js");
var spider = require("./spider.js");

var spiderio = null
  , observerio = null
  , observers = {}
  , spiders = {}
  , distributor = {
		get_spiders: function(){
			return spiders;
		},
		get_format_spiders: function(){
			var _spiders = this.get_spiders()
			  , spiders = {};
			
			for(id in _spiders){
				spiders[id] = _spiders[id].stat;
			}
			return spiders;
		},
		get_code: function(spider){
			observerio.emit('get code', {
				spiderid: spider.id,
				spider: spider.stat
			});
		},
		feed_code: function(spiderid, data){
			if(spiders[spiderid])
				spiders[spiderid].feed_code(data);
		},
		change_stat: function(spider){
			observerio.emit('change stat', {
				spiderid: spider.id,
				spider: spider.stat
			});
		},
		send_spider:  function (spiderid) {
			var _this = this
			  , spiders = _this.get_format_spiders();
			
	    	if(spiderid)
	    	observerio.emit("send spider", {
				spiderid: spiderid,
				spider: spiders[spiderid]
			});
			else
			observerio.emit("send spider", {
				spiderid: null,
				spider: spiders
			});
	    }
	};

module.exports = function(io){
	spiderio = io.of("/spider");
	observerio = io.of("/observer");

	spiderio.on('connection', function (socket) {
		socket.on('init', function (spiderinfo) {
			var spiderid = spiderinfo.id
			  , stat = spiderinfo.stat;
			spiders[spiderid] = new spider({
				id: spiderid,
				socket: socket,
				spiderio: spiderio,
				observerio: observerio,
				distributor: distributor,
				stat: stat
			});
			socket.on("disconnect", function(){
				console.log("spider " + spiderid + " disconnected");
				delete spiders[spiderid];
				distributor.send_spider();
			});
		});
	});

	observerio.on('connection', function (socket) {
		var observerid = socket.id;
		observers[observerid] = new observer({
			id: observerid,
			socket: socket,
			distributor: distributor
		});
		socket.on("disconnect", function(){
			console.log("observer " + observerid + " disconnected");
			delete observers[observerid];
			distributor.send_spider();
		});
	});
	
	return {
		observers: observers,
		spiders: spiders
	}
};