var ob = function(obj){
	this.id = obj.id;
	this.socket = obj.socket;
	this.distributor = obj.distributor;

	this.init();
};

ob.prototype = {
	
	init: function(){
		console.log("here comes a observer: ", this.id);
		
		var _this = this;
		
		_this.socket.on('get spider', function(spiderid){
			_this.send_spider(spiderid);
		});
		_this.socket.on('feed code', function (data) {
			_this.distributor.feed_code(data.spiderid, data.data);
		});
		
		_this.distributor.send_spider();
	}
};

module.exports = ob;