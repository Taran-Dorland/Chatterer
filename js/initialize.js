"use strict"

$(document).ready(function() {

    //Load saved channels into Bootstrap dropdown
    $.getJSON("acc-data.json", function(json) {

        var channelDD = $("#channel-dropDown");
        var options = json['account']['channels'];       
        
        $.each(options, function(val, text) {

            channelDD.append($('<option>', {
                value: val,
                text: text
            }));
        });

        channelDD.selectpicker('refresh');
    });

    


});