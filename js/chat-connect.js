"use strict"

$(document).ready(function() {

    //Form Items
    var channelDD = $("#channel-dropDown");
    var channelInput = $("#channelIn");
    var btnQConnect = $("button.btnQuickConnect");
    var btnConnect = $("button.btnConnect");
    var btnClose = $("button.btnClose");

    var messageContainer = $("#chat-container");
    var messageToSend = $("#msgSend");
    var charsLeft = $("#charRem");
    var toBottom = $("#btn-toBottom");

    var iconQuickAdd = $("#quickAdd");

    var nickName;
    var nickOAuth;
    var currChannel;
    var followedChannels = new Array();

    var queue = new Array();
    var scrolled = true;

    $.getJSON("acc-data.json", function(json) {
               
        console.log(json['account']['username']);
        console.log(json['account']['oauth-token']);

        //
        nickName = json['account']['username'];
        nickOAuth = json['account']['oauth-token'];
        followedChannels = json['account']['channels'];
    });

    const WebSocket = require('ws');
    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    //-------------------------------------------------------------------------
    //Connect to websocket, authenticate with username and OAUTH
    ws.on('open', function() {

        console.log("Connecting to server...");
        outputInfoMsg("Connecting to server...");

        ws.send('PASS ' + nickOAuth);
        ws.send('NICK ' + nickName);

        console.log("USER: " + nickName + " HAS BEEN AUTHENTICATED.");
        outputInfoMsg("User: " + nickName + " has been authenticated.");

        console.log("Connected.");
        outputInfoMsg("Connected.");
    });

    //-------------------------------------------------------------------------
    //Recieve incoming messages
    ws.on('message', function incoming(data) {

        //console.log(data);
        addMessage(data);
    });

    function addMessage(msg) {

        queue.push(msg);
        messageContainer.append("<div class='row bg-secondary chat-box'><p class='chat-message'>" + msg + "</p></div>");

        if (queue.length > 100) {

            queue.shift();
            $("div.chat-box").first().remove();
        }
        
        if (scrolled == true) {
            scrollToBottom(1);
        }
    }

    //-------------------------------------------------------------------------
    //Join channel specified by dropdown
    btnQConnect.on('click', function() {

        var input = channelDD.val().toLowerCase();
        joinChannel("#" + input);

        btnConnect.addClass("invisible");
        btnClose.removeClass("invisible");
    });

    //-------------------------------------------------------------------------
    //Join channel specified by input field
    btnConnect.on('click', function() {

        var input = channelInput.val().toLowerCase();
        joinChannel("#" + input);

        btnConnect.addClass("invisible");
        btnClose.removeClass("invisible");
    });

    //-------------------------------------------------------------------------
    //Close connection
    btnClose.on('click', function() {
        
        clearChat();
        partChannel();
        outputInfoMsg("Connection has been terminated.");
        console.log("Connection has been terminated.");

        btnClose.addClass("invisible");
        btnConnect.removeClass("invisible");
    });

    //-------------------------------------------------------------------------
    //Character limit on textarea message
    var textlimit = 256;

    messageToSend.keyup(function() {

        var tlength = $(this).val().length;
        $(this).val($(this).val().substring(0, textlimit));
        var tlength = $(this).val().length;
        var remain = textlimit - parseInt(tlength);
        charsLeft.text(remain + "/" + textlimit);
    });

    //-------------------------------------------------------------------------
    //Removes or adds the channel to the drop down select
    iconQuickAdd.on('click', function() {

        if (iconQuickAdd.hasClass("fa-minus-circle")) {         //Remove channel
            remFromQuickSelect(currChannel.substring(1));
        } else if (iconQuickAdd.hasClass("fa-plus-circle")) {   //Add channel
            addToQuickSelect(currChannel.substring(1));
        }


    });

    //-------------------------------------------------------------------------
    //Detects when user scrolls over chat
    //https://stackoverflow.com/questions/21211787/detect-div-scroll-jquery
    messageContainer.scroll(function() {

        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            scrolled = true;
            toBottom.addClass("invisible");
            toBottom.removeClass("visible");
        } else {
            scrolled = false;
            toBottom.addClass("visible");
            toBottom.removeClass("invisible");
        }
    });

    //-------------------------------------------------------------------------
    //Jump to bottom of chat
    toBottom.on('click', function() {

        scrollToBottom(1);
    });

    //-------------------------------------------------------------------------
    //Specific Functions
    //Clears all chat divs loaded on the page
    function clearChat() {
        $("div.chat-box").remove();
        queue = new Array();
        outputInfoMsg("Chat has been cleared.");
        console.log("Chat has been cleared.");
    }

    //Leaves current channel and joins new specified one
    function joinChannel(channel) {

        partChannel();

        outputInfoMsg("Joining channel " + channel + "...");
        ws.send('JOIN ' + channel);
        currChannel = channel;

        var followed = false;

        //Check if the currently joined channel is on the quick bar
        if (followedChannels[currChannel.substring(1)]) {

            followed = true;
            iconQuickAdd.removeClass("fa-plus-circle");
            iconQuickAdd.addClass("fa-minus-circle");
        }

        if (followed == false) {
            
            iconQuickAdd.removeClass("fa-minus-circle");
            iconQuickAdd.addClass("fa-plus-circle");
        }
    }

    //Leaves the current channel
    function partChannel() {
        outputInfoMsg("Parting channel " + currChannel + "...");
        ws.send('PART ' + currChannel);
    }

    //Template to send notification messages
    function outputInfoMsg(data) {

        messageContainer.append("<div class='row bg-info chat-box'><p class='chat-message'>" + data + "</p></div>");
    }

    //Automatically scroll to bottom of chat div
    function scrollToBottom(speed) {

        messageContainer.animate({"scrollTop": messageContainer[0].scrollHeight}, speed);
    }

    //
    //<i class="fas fa-plus-circle"></i>
    function addToQuickSelect(channelToAdd) {

        $.getJSON("acc-data.json", function(json) {

            console.log(json['account']['channels']);
            json['account']['channels'];

            var fs = require('fs');
            let jsonData = JSON.stringify(json, null, 2);
            fs.writeFileSync('acc-data.json', jsonData);

            //refreshDropDown();
        });
    }

    //
    //<i class="fas fa-minus-circle"></i>
    function remFromQuickSelect(channelToRemove) {

        $.getJSON("acc-data.json", function(json) {


        });
    }

    //
    function refreshDropDown() {

        $.getJSON("acc-data.json", function(json) {
           
            var options = json['account']['channels'];

            $.each(options, function(val, text) {

                channelDD.append($('<option>', {
                    value: val,
                    text: text
                }));
            });
    
            channelDD.selectpicker('refresh');
        });
    }

});