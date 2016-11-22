VoxEngine.forwardCallToUserDirect(function(call1,call2){
    call2.addEventListener(CallEvents.InfoReceived,function(e){
        call1.sendMessage(e.body);
    });
},true);