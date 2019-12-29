"use strict"

//API Token REQUEST
//https://id.twitch.tv/oauth2/authorize?client_id=cr8f8pqyx69yck2rbb57hdvln2ne8f&redirect_uri=http://localhost&response_type=token&scope=chat:read chat:edit
//https://dev.twitch.tv/docs/authentication/getting-tokens-oidc/#oidc-implicit-code-flow

$(document).ready(function() {

    /*
    -------------------------------------------------------------------
    Authenticates Twitch account and saves the OAUTH token and username
    to connect to Twitch chat
    */
   
    var AUTH_URL = "";
    var ACC_TOKEN = "oauth:";

    //------------------------------------
    //Connect to twitch account
    const webview = document.querySelector('webview')
    webview.addEventListener('dom-ready', () => {
        console.log(webview.getURL());

        AUTH_URL = webview.getURL();

        if (AUTH_URL.substring(0, 16) === "http://127.0.0.1") {

            //Get the OAUTH access token
            ACC_TOKEN = ACC_TOKEN + AUTH_URL.substring(31, 61);

            console.log(ACC_TOKEN);

            $.getJSON("acc-data.json", function(json) {
               
                //Insert ACC TOKEN to JSON
                json['account']['oauth-token'] = ACC_TOKEN;

                //Save JSON
                var fs = require('fs');
                let jsonData = JSON.stringify(json, null, 2);
                fs.writeFileSync('acc-data.json', jsonData);
            });
        }

    });






});