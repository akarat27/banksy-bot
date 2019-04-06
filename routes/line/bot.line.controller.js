var logger = require('./../../config/winston')(__filename)

var {middleware ,handlePreErr ,line_replyMessage ,line_pushMessage} = require('./../helpers/line.handler')


const $ = require('cheerio');
const puppeteer = require('puppeteer');


function checkPrefix(prefix){
    var found = msgText.match(prefix)
    return found;
}

//Flex message
var receiptTemplete = require('../../config/flex/receipt')
var joinmessage = require('../../config/flex/joinmessage');
var head_level = require('../../config/flex/receipt/head.level');
var price_level = require('../../config/flex/receipt/price.level');
var price_level2 = require('../../config/flex/receipt/price.level2');
var head_line = require('../../config/flex/receipt/hero.separator');

//google doc sheet
//const url = 'https://docs.google.com/spreadsheets/d/135iMYNkUkk17KAjeXzE7DPBHadjmrdLgpuRC00yV8-I/htmlview';
const docurl = 'https://docs.google.com/spreadsheets/d/135iMYNkUkk17KAjeXzE7DPBHadjmrdLgpuRC00yV8-I/edit#gid=1073260596';

function permiseReqsheet(tf) {
    return new Promise((resolve, reject) => {
        if (tf == 'day') {
            var sheetrockDay = require('sheetrock');
            sheetrockDay({
                url: docurl,
                query: "select H,I  ",
                reset: true,
                callback: function (error, options, response) {
                    if (!error) {
                        var items = response.rows
                        var priceselector = []
                        items.forEach(item => {
                            if(item.cellsArray[0].indexOf('%') > -1){
                                //[ '32.00%', '1083.40' ]
                                priceselector.push(item.cellsArray)
                            }
                        })
                        resolve(priceselector)
                    }else{
                        //console.log(error, options, response);
                        reject(error)
                    }
                }
            })
        }else if(tf == 'week') {
            var sheetrockWeek = require('sheetrock');
            sheetrockWeek({
                url: docurl,
                query: "select K,L",
                reset: true,
                callback: function (error, options, response) {
                    if (!error) {
                        var items = response.rows
                        var priceselector = []
                        items.forEach(item => {
                            if(item.cellsArray[0].indexOf('%') > -1){
                                priceselector.push(item.cellsArray)
                            }
                        })
                        resolve(priceselector)
                    }else{
                        //console.log(error, options, response);
                        reject(error)
                    }
                }
            })
        }
    })
}

async function loadSTD(tf,replyToken){
    var day = [];
    var week = [];

    if(tf == 'day' || tf == 'week'){
        await permiseReqsheet(tf)
            .then( (data) =>{
                line_replyMessage(replyToken ,{ type: 'flex',altText:'std', contents: buildReceipt(data,tf) } )
            })
            .catch( (err) => {
                //console.log(err)
            })
    }else{
        await permiseReqsheet('day')
            .then( (data) =>{
                line_pushMessage(replyToken ,{ type: 'flex',altText:'std', contents: buildReceipt(data,'day') } )
            })
            .catch( (err) => {
                //console.log(err)
            })
        await permiseReqsheet('week')
            .then( (data) =>{
                line_pushMessage(replyToken ,{ type: 'flex',altText:'std', contents: buildReceipt(data,'week') } )
            })
            .catch( (err) => {
                //console.log(err)
            })
    }

    /*
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
            var level = ['99.99'] //, '99.00', '95.00', '84.00', '50.00', '16.00', '5.00', '1.00', '0.01']
            //var dayselectors = [
            //    ['tbody > tr:nth-child(9) > td:nth-child(9)', 'tbody > tr:nth-child(9) > td:nth-child(10)']
            //]
            //var weekselectors = [
            //    ['tbody > tr:nth-child(9) > td:nth-child(12)', 'tbody > tr:nth-child(9) > td:nth-child(13)']
            //]

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
            //
            for (var i = 0; i < level.length; i++) {
                console.log($(dayselectors[i][0], html))
                console.log($(dayselectors[i][0], html).text())
                var dayrow = {percent: $(dayselectors[i][0], html).text(), price: $(dayselectors[i][1], html).text()}
                day.push(dayrow);

                var weekrow = {percent: $(weekselectors[i][0], html).text(), price: $(weekselectors[i][1], html).text()}
                week.push(weekrow);
            }


        })
        */
}

function copyDocumentObject(objectToCopy) {
    return JSON.parse(JSON.stringify(objectToCopy))
}

function buildReceipt(data,tf) {
    var receiptRoot = JSON.parse(JSON.stringify(receiptTemplete));
    head_level.contents[0].text  = tf=='day'?'Prob Day':'Prob Week'
    receiptRoot.body.contents.push(head_level);
    receiptRoot.body.contents.push(head_line);

    var level99_99 = copyDocumentObject(price_level)
    level99_99.contents[0].text  = data[0][0]
    level99_99.contents[1].text  = data[0][1]
    level99_99.contents[0].color = '#800000'
    level99_99.contents[1].color = '#800000'
    receiptRoot.body.contents.push(level99_99);

    var level99_50 = copyDocumentObject(price_level2)
    level99_50.contents[0].text = data[1][0]
    level99_50.contents[1].text = data[1][1]
    receiptRoot.body.contents.push(level99_50);

    var level99_00 = copyDocumentObject(price_level)
    level99_00.contents[0].text = data[2][0]
    level99_00.contents[1].text = data[2][1]
    level99_00.contents[0].color = '#cc0000'
    level99_00.contents[1].color = '#cc0000'
    receiptRoot.body.contents.push(level99_00);

    var level97_00 = copyDocumentObject(price_level2)
    level97_00.contents[0].text = data[3][0]
    level97_00.contents[1].text = data[3][1]
    receiptRoot.body.contents.push(level97_00);

    receiptRoot.body.contents.push(head_line);
    var level95_00 = copyDocumentObject(price_level)
    level95_00.contents[0].text = data[4][0]
    level95_00.contents[1].text = data[4][1]
    level95_00.contents[0].color = '#e06666'
    level95_00.contents[1].color = '#e06666'
    receiptRoot.body.contents.push(level95_00);

    var level89_50 = copyDocumentObject(price_level2)
    level89_50.contents[0].text = data[5][0]
    level89_50.contents[1].text = data[5][1]
    receiptRoot.body.contents.push(level89_50);

    receiptRoot.body.contents.push(head_line);
    var level84_00 = copyDocumentObject(price_level)
    level84_00.contents[0].text = data[6][0]
    level84_00.contents[1].text = data[6][1]
    level84_00.contents[0].color = '#e06666'
    level84_00.contents[1].color = '#e06666'
    receiptRoot.body.contents.push(level84_00);

    var level68_00 = copyDocumentObject(price_level2)
    level68_00.contents[0].text = data[7][0]
    level68_00.contents[1].text = data[7][1]
    receiptRoot.body.contents.push(level68_00);


    var level50_00 = copyDocumentObject(price_level)
    level50_00.contents[0].text = data[8][0]
    level50_00.contents[1].text = data[8][1]
    receiptRoot.body.contents.push(level50_00);

    var level32_00 = copyDocumentObject(price_level2)
    level32_00.contents[0].text = data[9][0]
    level32_00.contents[1].text = data[9][1]
    receiptRoot.body.contents.push(level32_00);

    var level16_00 = copyDocumentObject(price_level)
    level16_00.contents[0].text = data[10][0]
    level16_00.contents[1].text = data[10][1]
    level16_00.contents[0].color = '#7cb861'
    level16_00.contents[1].color = '#7cb861'
    receiptRoot.body.contents.push(level16_00);
    receiptRoot.body.contents.push(head_line);

    var level10_50 = copyDocumentObject(price_level2)
    level10_50.contents[0].text = data[11][0]
    level10_50.contents[1].text = data[11][1]
    receiptRoot.body.contents.push(level10_50);

    var level5_00 = copyDocumentObject(price_level)
    level5_00.contents[0].text = data[12][0]
    level5_00.contents[1].text = data[12][1]
    level5_00.contents[0].color = '#7cb861'
    level5_00.contents[1].color = '#7cb861'
    receiptRoot.body.contents.push(level5_00);
    receiptRoot.body.contents.push(head_line);

    var level3_00 = copyDocumentObject(price_level2)
    level3_00.contents[0].text = data[13][0]
    level3_00.contents[1].text = data[13][1]
    receiptRoot.body.contents.push(level3_00);

    var level1_00 = copyDocumentObject(price_level)
    level1_00.contents[0].text = data[14][0]
    level1_00.contents[1].text = data[14][1]
    level1_00.contents[0].color = '#6aa84f'
    level1_00.contents[1].color = '#6aa84f'
    receiptRoot.body.contents.push(level1_00);

    var level0_50 = copyDocumentObject(price_level2)
    level0_50.contents[0].text = data[15][0]
    level0_50.contents[1].text = data[15][1]
    receiptRoot.body.contents.push(level0_50);

    var level0_01 = copyDocumentObject(price_level)
    level0_01.contents[0].text = data[16][0]
    level0_01.contents[1].text = data[16][1]
    level0_01.contents[0].color = '#588d3f'
    level0_01.contents[1].color = '#588d3f'
    receiptRoot.body.contents.push(level0_01);

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

                    } else if (command[1] == 'week') {
                        loadSTD('week', replyToken)
                    } else {
                        if (req.body.events[0].source.groupId) {
                            replyToken = req.body.events[0].source.groupId
                        } else if (req.body.events[0].source.userId) {
                            replyToken = req.body.events[0].source.userId
                        }
                        loadSTD('', replyToken)
                    }
                }else if(checkPrefix('^(@menu)')){
                    var replyMsg = 'การใช้งาน\nพิมพ์ @tfex สำหรับกรอบราคาเดย์และวีค\nพิมพ์ @tfex day สำหรับกรอบเดย์\nพิมพ์ @tfex week สำหรับกรอบวีค'
                    line_replyMessage(replyToken, {type: 'text', text: replyMsg});
                }else if(checkPrefix('^(@bot)')){
                    var replyMsg = 'การใช้งาน\nพิมพ์ @tfex สำหรับกรอบราคาเดย์และวีค\nพิมพ์ @tfex day สำหรับกรอบเดย์\nพิมพ์ @tfex week สำหรับกรอบวีค'
                    line_replyMessage(replyToken, {type: 'text', text: replyMsg});
                }
            }
        }
        //next(req,res)
        res.json(req.body.events) // req.body will be webhook event object
    }catch(e){res.send(e)}
}

module.exports = { webhook ,middleware ,handlePreErr};