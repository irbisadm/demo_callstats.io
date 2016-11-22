var vox = VoxImplant.getInstance();
vox.init({micRequired: true,
    videoSupport:true,
    progressTone:true,
    callstatsIoParams:{
        AppID:settings.io_app_id,
        AppSecret:settings.io_app_secret,
    }});
vox.addEventListener(VoxImplant.Events.SDKReady, function(){
    vox.connect();
});
var call;
vox.addEventListener(VoxImplant.Events.ConnectionEstablished,function(){
    document.querySelector('.it_exit_link').addEventListener('click',cancelCall);
    document.querySelector('.it_start_link').addEventListener('click',answerCall);
    vox.login(settings.users[1].name+"@"+settings.app_name+"."+settings.account_name+".voximplant.com",settings.users[1].pass);
    vox.addEventListener(VoxImplant.Events.AuthResult,function(e) {
        vox.addEventListener(VoxImplant.Events.IncomingCall,function(e){
            e.call.sendAudio(false);
            document.querySelector('.callpopup').style.display = 'block';
            call = e.call;
            call.answer();
            call.addEventListener(VoxImplant.CallEvents.Connected,function () {
                call.mutePlayback();
                var remotevideo = document.getElementById(call.getVideoElementId());
                document.querySelector('.it_remote_video').appendChild(remotevideo);
                remotevideo.style.height = "100%";
                remotevideo.removeAttribute("height");
                remotevideo.removeAttribute("width");
                remotevideo.play();
            });
            call.addEventListener(VoxImplant.CallEvents.Disconnected,cancelCall);
            call.addEventListener(VoxImplant.CallEvents.Disconnected,Failed);

        })
    });
});
function answerCall(){
    document.querySelector('.it_exit_link').style.marginLeft = '-40px';
    document.querySelector('.it_start_link').style.display = 'none';
    vox.showLocalVideo(true);
    var localvideo = document.querySelector('#voximplantlocalvideo');
    document.querySelector('.it_local_video').appendChild(localvideo);
    document.querySelector('.it_local_video').style.display = 'block';
    document.querySelector('.it_connecting').style.display = "none";
    localvideo.style.height = "140px";
    localvideo.style.marginLeft = "-40px";
    localvideo.play();
    call.unmutePlayback();
    call.sendAudio(true);
    call.sendVideo(true);
    call.sendMessage('CONNECTED');
}
function cancelCall() {
    if(typeof call!="undefined")
        call.hangup();
    document.querySelector('.it_remote_video').removeChild(document.querySelector('.it_remote_video').childNodes[0]);
    document.querySelector('.it_connecting').style.display = "block";
    document.querySelector('.it_exit_link').style.marginLeft = '-110px';
    document.querySelector('.it_start_link').style.display = 'block';
    document.querySelector('.callpopup').style.display = 'none';
    document.querySelector('.it_local_video').style.display = 'none';
}