/**
 * Created by Tdz on 2016/10/12.
 */
var stompClient;
var webSocket = {
    socket: null,
    subscribeArr: [],
    url: "",
    conFlag: false,
    init: function (url, headers, subUrl, callBack, sendUrl, requestStr) {
        webSocket.url = url;
        webSocket.socket = new SockJS(webSocket.url);
        stompClient = Stomp.over(webSocket.socket);
        stompClient.connect(headers, function () {
            webSocket.conFlag = true;
            webSocket.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
        });
    },
    send: function (url, headers, requestStr) {
        stompClient.send(url, headers, JSON.stringify(requestStr));
    },
    subscribeAndSend: function (subUrl, callBack, sendUrl, headers, requestStr, state) {
        if (webSocket.subscribeArr.indexOf(subUrl) === -1 || state) {
        	if (webSocket.subscribeArr.indexOf(subUrl) === -1) {
        		webSocket.subscribeArr.push(subUrl);
        	}
            stompClient.subscribe(subUrl, callBack);
        }
        webSocket.send(sendUrl, headers, requestStr);
    },
    subscribe: function (headers, subUrl, callBack, sendUrl, requestStr, state) {
        if (stompClient.connected) {
            webSocket.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state);
            return;
        }
        stompClient.connect(headers, function () {
            webSocket.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
        });
    },
    unsubscribealarm: function (headers, url, requestStr) {
        stompClient.send(url, headers, JSON.stringify(requestStr));
    },
    abort: function(headers, url) {
    	stompClient.disconnect(url, headers);
    },
    close: function () {
        if (webSocket.socket == null) {

        } else {
            webSocket.socket.close();
        }
    }
};



