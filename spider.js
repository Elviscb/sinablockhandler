var spider = function(obj){
	this.id = obj.id;
	this.socket = obj.socket;
	this.distributor = obj.distributor;
	this.stat = obj.stat;

	this.init();
};

spider.prototype = {
	init: function(){
		console.log("here comes a spider: ", this.id);
		
		var _this = this;
		this.socket.on('get code', function (data) {
			_this.stat = data;
			_this.distributor.get_code(_this);
		});
		this.socket.on('change stat', function (data) {
			_this.stat = data;
			_this.distributor.change_stat(_this);
		});
		
		_this.distributor.send_spider();
	},
	feed_code: function (code){
		this.stat.blocker.data = null;
		this.socket.emit("feed code", code);
	}
};

module.exports = spider;