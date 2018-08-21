/**
 * Created by yaozhiguo on 2016/11/30.
 */
function resize(){
    document.getElementById('app').style.height = window.innerHeight + 'px';
    document.getElementById('app').style.width = window.innerWidth + 'px';
}
resize();
window.addEventListener("resize", function (event) {
    resize();
});

document.getElementById('codeTipData').onmouseover =  function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
}
document.getElementById('codeTipData').onmouseout =  function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    $("#codeTipData").addClass('hidden');
}