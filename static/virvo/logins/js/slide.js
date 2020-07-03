/**
 * Created by Alone on 2017/11/6.
 */
var box=document.getElementById('verify_box');
var xbox=document.getElementById('verify_xbox');
var element=document.getElementById('btn');
var b=box.offsetWidth;
var o=element.offsetWidth;
var capcode = document.getElementById('captchaCode');

element.ondragstart = function() {
    return false;
};
element.onselectstart = function() {
    return false;
};
element.onmousedown = function(e) {
    var disX = e.clientX - element.offsetLeft;
    document.onmousemove = function (e) {
        var l = e.clientX - disX +o;
        if(l<o){
            l=o
        }
        if(l>b){
            l=b
        }
        xbox.style.width = l + 'px';
    };
    document.onmouseup = function (e){
        var l = e.clientX - disX +o;
        if(l<b){
            l=o
        }else{
            l=b;
            console.log('captchaCode',capcode);
            capcode.setAttribute("value","sdfds_da234_df");
            xbox.innerHTML='  &nbsp; &nbsp; &nbsp; &nbsp; 验证通过<div id="btn" style="text-align: center ;"><img id="ded2"  src="/static/virvo/logins/images/kkkk.png"/></div>';
        }
        xbox.style.width = l + 'px';
        document.onmousemove = null;
        document.onmouseup = null;
    };
}