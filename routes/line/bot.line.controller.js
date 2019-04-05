var logger = require('./../../config/winston')(__filename)

var {middleware ,handlePreErr ,line_replyMessage ,line_pushMessage} = require('./../helpers/line.handler')
var joinmessage = require('../../config/flex/joinmessage');

const $ = require('cheerio');
const puppeteer = require('puppeteer');

function checkPrefix(prefix){
    var found = msgText.match(prefix)
    return found;
}

//Flex message
var receiptTemplete = require('../../config/flex/receipt')

//google doc sheet
const url = 'https://docs.google.com/spreadsheets/d/135iMYNkUkk17KAjeXzE7DPBHadjmrdLgpuRC00yV8-I/htmlview';

function loadSTD(tf,replyToken){
    var day = [];
    var week = [];
    puppeteer
        .launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
        .then(function(browser) {
            return browser.newPage();
        })
        .then(function(page) {
            return page.goto(url).then(function() {
                return page.content();
            });
        })
        .then(function(html) {
            var level = ['99.99', '99.00', '95.00', '84.00', '50.00', '16.00', '5.00', '1.00', '0.01']
            var dayselectors = [
                ['tbody > tr:nth-child(9) > td:nth-child(9)', 'tbody > tr:nth-child(9) > td:nth-child(10)'],
                ['tbody > tr:nth-child(11) > td:nth-child(9)', 'tbody > tr:nth-child(11) > td:nth-child(10)'],
                ['tbody > tr:nth-child(13) > td:nth-child(8)', 'tbody > tr:nth-child(13) > td:nth-child(9)'],
                ['tbody > tr:nth-child(15) > td:nth-child(9)', 'tbody > tr:nth-child(15) > td:nth-child(10)'],
                ['tbody > tr:nth-child(17) > td:nth-child(9)', 'tbody > tr:nth-child(17) > td:nth-child(10)'],
                ['tbody > tr:nth-child(19) > td:nth-child(9)', 'tbody > tr:nth-child(19) > td:nth-child(10)'],
                ['tbody > tr:nth-child(21) > td:nth-child(9)', 'tbody > tr:nth-child(21) > td:nth-child(10)'],
                ['tbody > tr:nth-child(23) > td:nth-child(9)', 'tbody > tr:nth-child(23) > td:nth-child(10)'],
                ['tbody > tr:nth-child(25) > td:nth-child(9)', 'tbody > tr:nth-child(25) > td:nth-child(10)']
            ]

            var weekselectors = [
                ['tbody > tr:nth-child(9) > td:nth-child(12)', 'tbody > tr:nth-child(9) > td:nth-child(13)'],
                ['tbody > tr:nth-child(11) > td:nth-child(11)', 'tbody > tr:nth-child(11) > td:nth-child(12)'],
                ['tbody > tr:nth-child(13) > td:nth-child(10)', 'tbody > tr:nth-child(13) > td:nth-child(11)'],
                ['tbody > tr:nth-child(15) > td:nth-child(12)', 'tbody > tr:nth-child(15) > td:nth-child(13)'],
                ['tbody > tr:nth-child(17) > td:nth-child(12)', 'tbody > tr:nth-child(17) > td:nth-child(13)'],
                ['tbody > tr:nth-child(19) > td:nth-child(12)', 'tbody > tr:nth-child(19) > td:nth-child(13)'],
                ['tbody > tr:nth-child(21) > td:nth-child(12)', 'tbody > tr:nth-child(21) > td:nth-child(13)'],
                ['tbody > tr:nth-child(23) > td:nth-child(11)', 'tbody > tr:nth-child(23) > td:nth-child(12)'],
                ['tbody > tr:nth-child(25) > td:nth-child(11)', 'tbody > tr:nth-child(25) > td:nth-child(12)'],
            ]

            for (var i = 0; i < level.length; i++) {
                var dayrow = {percent: $(dayselectors[i][0], html).text(), price: $(dayselectors[i][1], html).text()}
                day.push(dayrow);

                var weekrow = {percent: $(weekselectors[i][0], html).text(), price: $(weekselectors[i][1], html).text()}
                week.push(weekrow);
            }

            if(tf == 'day'){
                console.log(replyToken)
                line_replyMessage(replyToken ,{ type: 'text',text:JSON.stringify(day)});
                return day
            }else if(tf == 'week'){
                line_replyMessage(replyToken ,{ type: 'text',text:JSON.stringify(week)});
                return week
            }else{
                line_replyMessage(replyToken ,{ type: 'text',text:JSON.stringify(day)});
                line_replyMessage(replyToken ,{ type: 'text',text:JSON.stringify(week)});
            }
        })
}

function buildReceipt(order) {
    var receiptRoot = JSON.parse(JSON.stringify(receiptTemplete));
    receiptRoot.body.contents.push(head_logo);
    return receiptRoot;
}
/**
 * Line webhook ,action from line account
 * @param err
 * @param req
 * @param res
 * @param next
 */

function webhook(req,res){
    //console.log(req.body.events[0])
    try {
        if (req.body.events[0].type == 'join') {
            //send reply message to let member setting siteId
            //line_replyMessage(req.body.events[0].replyToken ,{ type: 'flex',altText:'Group Join', contents: joinmessage });

        } else if (req.body.events[0].type == 'leave') {

        } else if (req.body.events[0].type == 'message') {
            if (req.body.events[0].message.type == 'text') {
                replyToken = req.body.events[0].replyToken
                msgText = req.body.events[0].message.text

                if (checkPrefix('^(@tfex)')) {
                    msgText.replace('     ', ' ')
                    msgText.replace('    ', ' ')
                    msgText.replace('   ', ' ')
                    msgText.replace('  ', ' ')

                    command = msgText.split(' ')
                    if (command[1] == 'day') {
                        loadSTD('day', replyToken)
                        res.json({status: 'ok'})
                    } else if (command[1] == 'week') {
                        loadSTD('week', replyToken)
                        res.json({status: 'ok'})
                    } else {
                        loadSTD('all', replyToken)
                        res.json({status: 'ok'})
                    }
                } else {
                    line_replyMessage(replyToken, {type: 'text', text: msgText});
                }
            }
        }
        //next(req,res)
        res.json(req.body.events) // req.body will be webhook event object
    }catch(e){res.send(e)}
}

module.exports = { webhook ,middleware ,handlePreErr};