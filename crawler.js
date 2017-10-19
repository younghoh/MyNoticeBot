var RtmClient = require('@slack/client').RtmClient;
var request = require('request');
var cheerio = require('cheerio');
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var token = process.env.SLACK_API_TOKEN || '';

// 추가
function crawlingFunc(baseurl){
}

var rtm = new RtmClient(token, {logLevel: 'debug'});
rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name ==='general') { channel = c.id }
    }
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`)
})

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function(){
    rtm.sendMessage("정상적으로 연결", channel);
    var options = {
        url : "http://computer.cnu.ac.kr/index.php?mid=notice",
        headers : {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        }
    }
    setInterval(() => request(options, function(error, response, body){
        if (error) throw error;
        var $ = cheerio.load(body);
        //console.log($(".title > a"));
        // $(".title > a").each(function(){
        $(".bd_lst.bd_tb_lst.bd_tb > tbody tr").each(function(){
            var no = $(this).find('.no').text().trim();
            var title = $(this).find('.title > a').text().trim();
            var href = $(this).find('.title > a').attr('href');
            rtm.sendMessage(`${no} ${title} ${href}`, channel);
            //console.log(title);
        });
        //console.log(body);
    }),10000);
})


rtm.on(RTM_EVENTS.MESSAGE, function (message){
    var channel = message.channel;
    var user = message.user;
    var text = message.text;

    if (text == 'hello'){
        rtm.sendMessage("안녕", channel);
    }
})
// var baseurl = "http://computer.cnu.ac.kr/index.php?mid=notice";


