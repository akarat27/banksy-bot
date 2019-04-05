var logger = require('./../../config/winston')(__filename)
const APIError = require('./../helpers/APIError');
const httpStatus = require('http-status');
var _ = require('lodash');

var {middleware ,handlePreErr ,line_replyMessage ,line_pushMessage} = require('./../helpers/line.handler')
var {formatJSON , formatJSONWrap ,printText ,isUndefined ,isNull} = require('./../helpers/text.handler')
//DB cache
var mongoose = require('mongoose');

//const StringBuilder = require("string-builder");

//Fleax message
var receiptTemplete = require('../../config/flex/receipt')
var head_spaceline = require('./../../config/flex/receipt/spaceline')

var hero_date = require('../../config/flex/receipt/price.level')
var hero_separator = require('./../../config/flex/receipt/hero.separator')

var body_contents = require('./../../config/flex/receipt/body.contents')

var foot_separator = require('./../../config/flex/receipt/hero.separator_extra')

//json query
var jp = require('jsonpath');

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


function buildReceipt(order) {
    var receiptRoot = JSON.parse(JSON.stringify(receiptTemplete));
    var headdate = JSON.parse(JSON.stringify(hero_date));

    return receiptRoot;
}

function getValue(jsonObject,key){
    if(!isUndefined(jsonObject.key)){
        return jsonObject.key;
    }else{
        return 'undefined';
    }

}

/**
 * tfex
 * @param req
 * @param res
 * @param next
 */
function tfex(req, res, next) {

    const url = 'https://docs.google.com/spreadsheets/d/135iMYNkUkk17KAjeXzE7DPBHadjmrdLgpuRC00yV8-I/htmlview';
    puppeteer
        .launch()
        .then(function(browser) {
            return browser.newPage();
        })
        .then(function(page) {
            return page.goto(url).then(function() {
                return page.content();
            });
        })
        .then(function(html) {
            var day = [];
            var week = [];

            var level =['99.99','99.00','95.00','84.00','50.00','16.00','5.00','1.00','0.01']
            var dayselectors = [
                ['tbody > tr:nth-child(9) > td:nth-child(9)','tbody > tr:nth-child(9) > td:nth-child(10)'],
                ['tbody > tr:nth-child(11) > td:nth-child(9)','tbody > tr:nth-child(11) > td:nth-child(10)'],
                ['tbody > tr:nth-child(13) > td:nth-child(8)','tbody > tr:nth-child(13) > td:nth-child(9)'],
                ['tbody > tr:nth-child(15) > td:nth-child(9)','tbody > tr:nth-child(15) > td:nth-child(10)'],
                ['tbody > tr:nth-child(17) > td:nth-child(9)','tbody > tr:nth-child(17) > td:nth-child(10)'],
                ['tbody > tr:nth-child(19) > td:nth-child(9)','tbody > tr:nth-child(19) > td:nth-child(10)'],
                ['tbody > tr:nth-child(21) > td:nth-child(9)','tbody > tr:nth-child(21) > td:nth-child(10)'],
                ['tbody > tr:nth-child(23) > td:nth-child(9)','tbody > tr:nth-child(23) > td:nth-child(10)'],
                ['tbody > tr:nth-child(25) > td:nth-child(9)','tbody > tr:nth-child(25) > td:nth-child(10)']
            ]

            var weekselectors = [
                ['tbody > tr:nth-child(9) > td:nth-child(12)','tbody > tr:nth-child(9) > td:nth-child(13)'],
                ['tbody > tr:nth-child(11) > td:nth-child(11)','tbody > tr:nth-child(11) > td:nth-child(12)'],
                ['tbody > tr:nth-child(13) > td:nth-child(10)','tbody > tr:nth-child(13) > td:nth-child(11)'],
                ['tbody > tr:nth-child(15) > td:nth-child(12)','tbody > tr:nth-child(15) > td:nth-child(13)'],
                ['tbody > tr:nth-child(17) > td:nth-child(12)','tbody > tr:nth-child(17) > td:nth-child(13)'],
                ['tbody > tr:nth-child(19) > td:nth-child(12)','tbody > tr:nth-child(19) > td:nth-child(13)'],
                ['tbody > tr:nth-child(21) > td:nth-child(12)','tbody > tr:nth-child(21) > td:nth-child(13)'],
                ['tbody > tr:nth-child(23) > td:nth-child(11)','tbody > tr:nth-child(23) > td:nth-child(12)'],
                ['tbody > tr:nth-child(25) > td:nth-child(11)','tbody > tr:nth-child(25) > td:nth-child(12)'],
            ]

            for(var i=0; i < level.length; i++){
                var dayrow = {percent:$(dayselectors[i][0],html).text(),price:$(dayselectors[i][1],html).text()}
                day.push(dayrow);

                var weekrow = {percent:$(weekselectors[i][0],html).text(),price:$(weekselectors[i][1],html).text()}
                week.push(weekrow);
            }

            console.log(day);
            console.log(week);

            //#\31 073260596 > div.ritz.grid-container > table > tbody > tr:nth-child(9) > td:nth-child(10)
            //console.log(html);
        })
        .catch(function(err) {
           next(err);
        });
}


module.exports = { tfex ,};