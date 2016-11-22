const readline = require('readline');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'VI Installer> '
});

var params = {
    account_id :'',
    api_key: '',
    account_name :'',
    io_app_id:'',
    io_app_secret:'',
    users:[]
};
var auth = '';
const install_manifest = JSON.parse(fs.readFileSync('./voxengine/install_manifest.json', 'utf8'));

// Get required data from user
rl.question('Hello! What you voximplant account_id ? (see https://manage.voximplant.com/#apiaccess) > ', (answer) => {
    params.account_id = answer;
    rl.question('What you voximplant api_key ? (see https://manage.voximplant.com/#apiaccess) > ', (answer) => {
        params.api_key = answer;
        rl.question('What you Callstats.io AppID ? > ', (answer) => {
            params.io_app_id = answer;
            rl.question('What you Callstats.io AppSecret ? > ', (answer) => {
                params.io_app_secret = answer;
                auth = 'account_id='+params.account_id+'&api_key='+params.api_key+'&';
                runRequests();
            })
        })
    })
});

//Run installer script
function runRequests(){
    //Check app,script and same users. If exist - abort
    fetch('https://api.voximplant.com/platform_api/GetApplications?'+auth+'application_name='+install_manifest.app_name)
        .then((res) =>{
            return res.json();
        }).then((json) => {
            if(json.total_count>0){
                throw new Error('ERR: Application already exist!')
            }else{
                return fetch('https://api.voximplant.com/platform_api/Logon?'+auth);
            }
        })
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            params.account_name = json.account_name;
            rl.write("==============================================================\r\n\r\n");
            return Promise.all(install_manifest.users.map((item)=>{
                let pass = crypto.randomBytes(8).toString('hex');
                rl.write('User: '+item.name+" password: "+pass+" \r\n");
                params.users.push({name:item.name,pass:pass});
                var runurl = 'https://api.voximplant.com/platform_api/AddUser?'+auth+
                    '&user_name='+item.name+
                    "&user_display_name="+item.display_name+"&user_password="+pass;
                return fetch(runurl)
            }))
        })
        .then(()=>{
            rl.write("\r\n==============================================================\r\n");
            rl.write("LOG: Users created \r\n");
            var runurl = 'https://api.voximplant.com/platform_api/AddApplication?'+auth+
                '&application_name='+install_manifest.app_name+
                '&busy_on_call='+install_manifest.busy_on_call;
            return fetch(runurl);
        })
        .then(()=>{
            rl.write("LOG: Application created \r\n");
            return Promise.all(install_manifest.users.map((item)=>{
                var runurl = 'https://api.voximplant.com/platform_api/BindUser?'+auth+
                    '&user_name='+item.name+
                    "&application_name="+install_manifest.app_name+"&bind=true";
                return fetch(runurl);
            }))
        })
        .then(()=>{
            rl.write("LOG: Users bind \r\n");
            return Promise.all(install_manifest.scenarios.map((item)=>{
                return fetch('https://api.voximplant.com/platform_api/AddScenario?'+auth+
                    '&scenario_name='+item.name+
                    "&scenario_script="+fs.readFileSync('./voxengine/'+item.name+'.js', 'utf8'))
            }))
        })
        .then(()=>{
            rl.write("LOG: Scenario created \r\n");
            return Promise.all(install_manifest.rules.map((item)=>{
                var runurl = 'https://api.voximplant.com/platform_api/AddRule?'+auth+
                "&application_name="+install_manifest.app_name+
                "&rule_name="+item.name+
                "&rule_pattern="+item.pattern+
                "&rule_pattern_exclude="+item.exclude+
                "&scenario_name="+item.scenarios.join(';');
                return fetch(runurl);
            }));
        })
        .then(()=>{
            rl.write("LOG: Rules created \r\n");
            let data = 'var settings = JSON.parse(\''+JSON.stringify({
                    app_name: install_manifest.app_name,
                    account_name :params.account_name,
                    io_app_id:params.io_app_id,
                    io_app_secret:params.io_app_secret,
                    users:params.users})+'\');';
            fs.writeFileSync('./webapp/settings.js',data, 'utf8');
            fs.writeFileSync('./run/install.json',JSON.stringify(params), 'utf8');
            rl.close();
        })
        .catch(function(err) {
            console.error('ERR: Something gone wrong. ' +err.message);

            rl.close();
        });
}
