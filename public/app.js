'use strict';

/* App Module */

var obApp = angular.module('obApp', [
  'ngRoute',
  'ngAnimate',
  'btford.socket-io'
]);

obApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/list', {
        templateUrl: 'partials/spider-list.html',
        controller: 'ListCtrl'
      }).
      when('/list/:spiderid', {
        templateUrl: 'partials/spider-detail.html',
        controller: 'DetailCtrl'
      }).
      otherwise({
        redirectTo: '/list'
      });
  }]
);

obApp.factory('Config', 
  function(){
	return {
		background: {
			socketUrl: "/observer"
		},
		STATUS: {
			WORKING: "working",
			WAITING: "waiting"
		}
		
	};
  }
).factory('socket', ['$rootScope', 'Config', 'socketFactory',
  function($rootScope, conf, socketFactory){
	$rootScope.spiders = {};
	
	var socket = io(conf.background.socketUrl, {
			"reconnectionDelay": 2000,
			"reconnectionDelayMax": 2000 * 60
		})
	  , socketFactory = new socketFactory({
		  	prefix: 'socket~',
		    ioSocket: socket
		})
	  , loop = function (data){
			$.each(data, function(k, v){
				delete data[k];
				if($.isArray(v) || $.isPlainObject(v)){
					data[decodeURI(k)] = loop(v);
				}else if(v && v.substring)
					data[decodeURI(k)] = decodeURI(v);
				else data[decodeURI(k)] = v;
			});
			return data;
		};
	
	socket.on("send spider", function(data){
		$rootScope.$apply(function(){
			if(data.spiderid) $rootScope.spiders[data.spiderid] = loop(data.spider);
			else $rootScope.spiders = loop(data.spider);
		});
	});
	
	socket.on("change stat", function(data){
		$rootScope.$apply(function(){
			$rootScope.spiders[data.spiderid] = loop(data.spider);
		});
	});
	
	socket.on('get code', function(data){
		$rootScope.$apply(function(){
			$rootScope.spiders[data.spiderid] = loop(data.spider);
		});
    });
	
	$rootScope.$watchCollection("spiders", function(){
		var hotwbtime = 0
		  , k;
		
		for(k in $rootScope.spiders){
			if($rootScope.spiders[k].task_data.hotwb &&
				$rootScope.spiders[k].task_data.hotwb.lastTime > hotwbtime)
			hotwbtime = $rootScope.spiders[k].task_data.hotwb.lastTime;
		}
		
		$rootScope.spider_com = {
			"上次抓取热门微博时间": new Date(hotwbtime).toLocaleString()
		};
	});
	
	return socketFactory;
  }]
);

obApp.controller('Main', ['socket', function(socket){
	
}]);

obApp.controller('ListCtrl', ['$rootScope', '$scope', 'socket',
    function($rootScope, $scope, socket){
	$scope.feed = function(spiderid, code){
		socket.emit("feed code", {
			spiderid: spiderid,
			data: code
		});
	};
}]).controller('DetailCtrl', ['$rootScope', '$scope', '$routeParams',
    function($rootScope, $scope, $routeParams){
    $scope.spiderid = $routeParams.spiderid;
}]);

obApp.filter("restTime", function(){
	return function(input){
		if(!input) return '';
		
		input = input / 1000;
		
		if(input < 0) input = 0-input;
		
		var s_all = input
		  , s = s_all % 60
		  , m_all = parseInt(s_all / 60)
		  , m = m_all % 60
		  , h_all = parseInt(m_all / 60)
		  , h = h_all % 24
		  , d_all = parseInt(h_all / 24);

		if(h_all == 0)
		return m_all+"分";
		if(d_all == 0)
		return h_all+"小时"+m+"分";
		return d_all+"天"+h+"小时"+m+"分";
	}
	
}).filter("df", function(){
	return function(input){
		if(!input) return '';
		
		return new Date(input).toLocaleString();
	}
	
});