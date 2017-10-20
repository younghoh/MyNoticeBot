var RtmClient = require('@slack/client').RtmClient;
var request = require('request');
var cheerio = require('cheerio');
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var token = process.env.SLACK_API_TOKEN || '';

// 추가
function equalArray(array, tempArray){
    let resultArray = [];
    for(i = 0; i < array.length ; i++){
        if(array.indexOf(tempArray[i]) === -1){
            resultArray.push(i);
        }
    }
    return resultArray;
}

function crawlingFunc(baseurl, timer){
    var titleArray = [];
    var flag = true;
    var options = {
        url : baseurl,
        headers : {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        }
    }
    return () => setInterval(() => request(options, function(error, response, body){
        if (error) throw error;
        var $ = cheerio.load(body);
        var tempTitleArray = [];
        var tempArray = [];
        $(".bd_lst.bd_tb_lst.bd_tb > tbody tr").each(function(){
            var no = $(this).find('.no').text().trim();
            var title = $(this).find('.title > a').text().trim();
            var href = $(this).find('.title > a').attr('href');
            if(flag) titleArray.push(title);
            tempTitleArray.push(title);
            tempArray.push({
                title : title,
                no : no,
                href : href
            });
        });
        flag = false;
        var resultArray = equalArray(titleArray, tempTitleArray);
        if(resultArray.length !== 0){
            for(i = 0; i < resultArray.length ; i++){
                rtm.sendMessage(`${tempArray[resultArray[i]].no} ${tempArray[resultArray[i]].title} ${tempArray[resultArray[i]].href}`, channel);                            
            }
            flag = true;
        }
    }),timer * 1000);
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

    let crawlingNotice = crawlingFunc("http://computer.cnu.ac.kr/index.php?mid=notice", 10);
    let crawlingGeneralNotice = crawlingFunc("http://computer.cnu.ac.kr/index.php?mid=gnotice", 10);
    let crawlingSWUnivNotice = crawlingFunc("http://computer.cnu.ac.kr/index.php?mid=saccord", 10);
    let crawlingJobNotice = crawlingFunc("http://computer.cnu.ac.kr/index.php?mid=job", 10);
    crawlingNotice();
    crawlingGeneralNotice();
    crawlingSWUnivNotice();
    crawlingJobNotice();
})


rtm.on(RTM_EVENTS.MESSAGE, function (message){
    var channel = message.channel;
    var user = message.user;
    var text = message.text;

    if (text == 'hello'){
        rtm.sendMessage("안녕", channel);
    }
})


