var vox = VoxImplant.getInstance();
vox.init({micRequired: true,
    videoSupport:true,
    progressTone:true,
    callstatsIoParams:{
        AppID:settings.io_app_id,
        AppSecret:settings.io_app_secret,
    }});
var loadingTimer;
var step=0;
vox.addEventListener(VoxImplant.Events.SDKReady, function(){
    vox.connect();

});
var call;
vox.addEventListener(VoxImplant.Events.ConnectionEstablished,function(){
    vox.showLocalVideo(true);
    var localvideo = document.querySelector('#voximplantlocalvideo');

    document.querySelector('.it_remote_video').appendChild(localvideo);
    localvideo.style.height = "100%";

    localvideo.play();
    document.querySelector('.it_exit_link').addEventListener('click',function(){
        console.log('click')
        if(typeof call!="undefined"){
            call.hangup();
        }else{
            returnToIndex();
        }
    })
    vox.login(settings.users[0].name+"@"+settings.app_name+"."+settings.account_name+".voximplant.com",settings.users[0].pass);
    vox.addEventListener(VoxImplant.Events.AuthResult,function(e){
        if(e.result){
            call = vox.call(settings.users[1].name,true);
            call.addEventListener(VoxImplant.CallEvents.Connected,function () {
                call.addEventListener(VoxImplant.CallEvents.MessageReceived,function(e){
                    if(e.text=="CONNECTED"){
                        document.querySelector('.it_local_video').style.display = "block";
                        document.querySelector('.it_local_video').appendChild(localvideo);
                        document.querySelector('.it_connecting').style.display = "none";
                        localvideo.style.height = "140px";
                        localvideo.style.marginLeft = "-40px";
                        localvideo.play();
                        var remotevideo = document.getElementById(call.getVideoElementId());

                        document.querySelector('.it_remote_video').appendChild(remotevideo);
                        remotevideo.style.height = "100%";
                        remotevideo.removeAttribute("height");
                        remotevideo.removeAttribute("width");


                        remotevideo.play();
                    }
                });

            });
            call.addEventListener(VoxImplant.CallEvents.Disconnected,returnToIndex);
            call.addEventListener(VoxImplant.CallEvents.Disconnected,Failed);
        }else{
            returnToIndex();
        }
    })
});
vox.addEventListener(VoxImplant.Events.ConnectionFailed,returnToIndex);
vox.addEventListener(VoxImplant.Events.ConnectionClosed,returnToIndex);
function returnToIndex() {
    document.location.href = document.location.href.replace("call.html","");
}
