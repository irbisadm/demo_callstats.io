const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const install_manifest = JSON.parse(fs.readFileSync('./voxengine/install_manifest.json', 'utf8'));
const params = JSON.parse(fs.readFileSync('./run/install.json', 'utf8'));
const auth = 'account_id='+params.account_id+'&api_key='+params.api_key+'&';

//Run installer script
function runRequests(){
    //Check app,script and same users. If exist - abort
    fetch('https://api.voximplant.com/platform_api/DelApplication?'+auth+'application_name='+install_manifest.app_name)
        .then(() => {
            return Promise.all(install_manifest.users.map((item)=>{
                var runurl = 'https://api.voximplant.com/platform_api/DelUser?'+auth+
                    '&user_name='+item.name;
                return fetch(runurl)
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
            fs.writeFileSync('./webapp/settings.js',data, 'utf8');
            fs.writeFileSync('./run/install.json',JSON.stringify(params), 'utf8');
        })
        .catch(function(err) {
            console.error('ERR: Something gone wrong. ' +err.message);
        });
}
