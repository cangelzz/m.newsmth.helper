//remove baidu
//var baidu = $("script[src*='http://hm.baidu.com']");
//console.log("found: " + baidu.length);
//baidu.remove();
function doBeforeLoad(event){
    if (event.url.match(/hm.baidu.com/)) {
        event.preventDefault();
        console.log("blocked: " + event);
    }
    
}

document.addEventListener('beforeload', doBeforeLoad , true);