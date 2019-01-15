var ajaxCall = window.ajaxCall || {};

ajaxCall.initate = function(method, url, callback, data) {
    var xhr = new XMLHttpRequest();
    var postQuery = {};
    if(method == 'POST') {
         postQuery = typeof data == 'string' ? data : Object.keys(data).map(
            function(i){ return encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) }
        ).join('&');
    }
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }
    xhr.open(method, url, true);
    xhr.send(postQuery);
};