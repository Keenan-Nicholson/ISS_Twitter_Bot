const twit = require('twit');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();

rule.tz = 'America/St_Johns';
rule.second = 0;
rule.minute = 00;
rule.hour = 12;

/**
 * Auth info
 */
var twt = new twit({
    consumer_key : '',
    consumer_secret : '',
    access_token : '',
    access_token_secret : ''
    });


//Regex conditions for finding info in elements of locationData array
const regTime = /(([01]?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/;
const regDuration = /(([0-9]) [m][i][n])/;
const regLocationDegree = /(([0-9])(°) )/;


const job = schedule.scheduleJob(rule, function() {
    const getLocationSJ = async () => {
        // get html text from ISS
        const response = await fetch('https://spotthestation.nasa.gov/sightings/view.cfm?country=Canada&region=Newfoundland&city=Saint_Johns#.YmhIZdPMK5c')
        
        // using await to ensure that the promise resolves
        const body = await response.text();

        // parse the html text and extract location data
        const $ = cheerio.load(body);
        const data = [];
        $('table').each(function() {         
            var tr = $(this).next(); 
            data.push( tr.text());
        });
        
        fs.writeFile('locDataSJ.txt',data.toString(), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })
        
    }

    const getLocationCB = async () => {
        // get html text from ISS
        const response = await fetch('https://spotthestation.nasa.gov/sightings/view.cfm?country=Canada&region=Newfoundland&city=Corner_Brook#.YmwIytPMK5c')
        
        // using await to ensure that the promise resolves
        const body = await response.text();

        // parse the html text and extract location data
        const $ = cheerio.load(body);
        const data = [];
        $('table').each(function() {         
            var tr = $(this).next(); 
            data.push( tr.text());
        });
        
        fs.writeFile('locDataCB.txt',data.toString(), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })
        
    }

    const getLocationGFW = async () => {
        // get html text from ISS
        const response = await fetch('https://spotthestation.nasa.gov/sightings/view.cfm?country=Canada&region=Newfoundland&city=Grand_Falls#.YmwKi9PMK5c')
        
        // using await to ensure that the promise resolves
        const body = await response.text();

        // parse the html text and extract location data
        const $ = cheerio.load(body);
        const data = [];
        $('table').each(function() {         
            var tr = $(this).next(); 
            data.push( tr.text());
        });
        
        fs.writeFile('locDataGFW.txt',data.toString(), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })
        
    }
    const getLocationGoose = async () => {
        // get html text from ISS
        const response = await fetch('https://spotthestation.nasa.gov/sightings/view.cfm?country=Canada&region=Newfoundland&city=Goose_Bay#.Ym27iNPMJhE')
        
        // using await to ensure that the promise resolves
        const body = await response.text();

        // parse the html text and extract location data
        const $ = cheerio.load(body);
        const data = [];
        $('table').each(function() {   
                  
            var tr = $(this).next(); 
            data.push( tr.text());
        });
        
        fs.writeFile('locDataGFW.txt',data.toString(), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })  
    }

    async function runWebScrape(){
        await getLocationSJ();
        await getLocationCB();
        await getLocationGFW();
        await getLocationGoose();
    }

    /**
     * readData reads from a .txt file containing ISS location data for the next 15 days
     * @returns String of location data
     */
    function readDataSJ(){
        try {
            const data = fs.readFileSync('/home/keenanbnicholson/twitterBot/locDataSJ.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    function readDataCB(){
        try {
            const data = fs.readFileSync('/home/keenanbnicholson/twitterBot/locDataCB.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    function readDataGFW(){
        try {
            const data = fs.readFileSync('/home/keenanbnicholson/twitterBot/locDataGFW.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    function readDataGoose(){
        try {
            const data = fs.readFileSync('/home/keenanbnicholson/twitterBot/locDataGoose.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    //tomorrows date
    const today = new Date()
    var tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    printingDate = tomorrow.toDateString();
    tomorrow = tomorrow.toISOString();
    tomorrow = tomorrow.slice(0,10)

    //Creates an array of the location data separated by day
    let locationDataSJ = readDataSJ().split("|");
    let locationDataCB = readDataCB().split("|");
    let locationDataGFW = readDataGFW().split("|");
    let locationDataGoose = readDataGoose().split("|");

    /**
     * Matches tomorrows date with element of locationData, tweets the ISS location data for tomorrows date
     */

    // St.Johns
    for(let i =0;i<locationDataSJ.length;i++){
        let directionIndex1 = locationDataSJ[i].lastIndexOf(',')
        let directionIndex2 = locationDataSJ[i].indexOf('°')

        if(locationDataSJ[i].slice(0,10) == tomorrow){
            
            twt.post('statuses/update', { status: 'The #ISS will be visible from St. Johns tomorrow, '
                + printingDate
                +', at '
                +locationDataSJ[i].match(regTime)[0]
                +' for '
                +locationDataSJ[i].match(regDuration)[0]
                +'(s).'
                +'\n'
                +'\n'
                +'Location: '
                +locationDataSJ[i].match(regLocationDegree[0])
                +' '
                +locationDataSJ[i].slice(directionIndex2 +2, directionIndex1)
                +'\n'
                +'\n'
                +'\n'
                +'\n'
                + '#StJohns #CornerBrook #GFW #GrandFalls #GooseBay #HVGB #Labrador #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }
    //Corner Brook
    for(let i =0;i<locationDataCB.length;i++){
    let directionIndex1 = locationDataCB[i].lastIndexOf(',')
    let directionIndex2 = locationDataCB[i].indexOf('°')

        if(locationDataCB[i].slice(0,10) == tomorrow){
            
            twt.post('statuses/update', { status: 'The #ISS will be visible from Corner Brook tomorrow, '
                + printingDate
                +', at '
                +locationDataCB[i].match(regTime)[0]
                +' for '
                +locationDataCB[i].match(regDuration)[0]
                +'(s).'
                +'\n'
                +'\n'
                +'Location: '
                +locationDataCB[i].match(regLocationDegree[0])
                +' '
                +locationDataCB[i].slice(directionIndex2 +2, directionIndex1)
                +'\n'
                +'\n'
                +'\n'
                +'\n'
                + '#StJohns #CornerBrook #GFW #GrandFalls #GooseBay #HVGB #Labrador #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }
    //Grand-Falls
    for(let i =0;i<locationDataGFW.length;i++){
        let directionIndex1 = locationDataGFW[i].lastIndexOf(',')
        let directionIndex2 = locationDataGFW[i].indexOf('°')

        if(locationDataGFW[i].slice(0,10) == tomorrow){
            
            twt.post('statuses/update', { status: 'The #ISS will be visible from Grand Falls tomorrow, '
                + printingDate
                +', at '
                +locationDataGFW[i].match(regTime)[0]
                +' for '
                +locationDataGFW[i].match(regDuration)[0]
                +'(s).'
                +'\n'
                +'\n'
                +'Location: '
                +locationDataGFW[i].match(regLocationDegree[0])
                +' '
                +locationDataGFW[i].slice(directionIndex2 +2, directionIndex1)
                +'\n'
                +'\n'
                +'\n'
                +'\n'
                + '#StJohns #CornerBrook #GFW #GrandFalls #GooseBay #HVGB #Labrador #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }
    for(let i =0;i<locationDataGoose.length;i++){
        let directionIndex1 = locationDataGoose[i].lastIndexOf(',')
        let directionIndex2 = locationDataGoose[i].indexOf('°')

        if(locationDataGoose[i].slice(0,10) == tomorrow){
            
            twt.post('statuses/update', { status: 'The #ISS will be visible from Goose Bay tomorrow, '
                + printingDate
                +', at '
                +locationDataGoose[i].match(regTime)[0]
                +' for '
                +locationDataGoose[i].match(regDuration)[0]
                +'(s).'
                +'\n'
                +'\n'
                +'Location: '
                +locationDataGoose[i].match(regLocationDegree[0])
                +' '
                +locationDataGoose[i].slice(directionIndex2 +2, directionIndex1)
                +'\n'
                +'\n'
                +'\n'
                +'\n'
                + '#StJohns #CornerBrook #GFW #GrandFalls #GooseBay #HVGB #Labrador #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }
    runWebScrape();
});