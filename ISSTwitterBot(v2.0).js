const twit = require('twit');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const sleep = require('sleep');

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
const regDuration = /(([0-9]))/;
const regLocationDegree = /(([0-9])(°) )/;


const job = schedule.scheduleJob({hour: 12, minute: 00}, function() {
    console.log('Running program.')
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
    async function runWebScrape(){
        console.log(await getLocationSJ());
        console.log(await getLocationCB());
        console.log(await getLocationGFW());
    }

    /**
     * readData reads from a .txt file containing ISS location data for the next 15 days
     * @returns String of location data
     */
    function readDataSJ(){
        try {
            const data = fs.readFileSync('C:\\Users\\keena\\Documents\\JavaScript\\locDataSJ.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    function readDataCB(){
        try {
            const data = fs.readFileSync('C:\\Users\\keena\\Documents\\JavaScript\\locDataCB.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    function readDataGFW(){
        try {
            const data = fs.readFileSync('C:\\Users\\keena\\Documents\\JavaScript\\locDataGFW.txt', 'utf8');
            return data;
        } catch (err) {
            console.error(err);
        }
    }
    //tomorrows date
    var tomorrow = new Date();
    var dd = String(tomorrow.getDate()+1).padStart(2, '0');
    var mm = String(tomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = tomorrow.getFullYear();
    tomorrow = yyyy+'-'+mm+'-'+dd;

    //Creates an array of the location data separated by day
    let locationDataSJ = readDataSJ().split("|");
    let locationDataCB = readDataCB().split("|");
    let locationDataGFW = readDataGFW().split("|");

    /**
     * Matches tomorrows date with element of locationData, tweets the ISS location data for tomorrows date
     */
    // St.Johns
    for(let i =0;i<locationDataSJ.length;i++){
        let directionIndex1 = locationDataSJ[i].lastIndexOf(',')
        let directionIndex2 = locationDataSJ[i].indexOf('°')

        if(locationDataSJ[i].slice(0,10) == tomorrow){
            console.log('SJ tweet if entered ' + i);
            twt.post('statuses/update', { status: 'The #ISS will be visible from St. Johns tomorrow, '
                + tomorrow
                +', at '
                +locationDataSJ[i].match(regTime)[0]
                +' for '
                +locationDataSJ[i].match(regDuration)[0]
                +' '
                +'minutes.'
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
                + '#StJohns #CornerBrook #GFW #GrandFalls #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }
    //Corner Brook
    for(let i =0;i<locationDataCB.length;i++){
    let directionIndex1 = locationDataCB[i].lastIndexOf(',')
    let directionIndex2 = locationDataCB[i].indexOf('°')

        if(locationDataCB[i].slice(0,10) == tomorrow){
            console.log('CB tweet if entered ' + i);
            twt.post('statuses/update', { status: 'The #ISS will be visible from Corner Brook tomorrow, '
                + tomorrow
                +', at '
                +locationDataCB[i].match(regTime)[0]
                +' for '
                +locationDataCB[i].match(regDuration)[0]
                +' '
                +'minutes.'
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
                + '#StJohns #CornerBrook #GFW #GrandFalls #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
    }
}
    //Grand-Falls
    for(let i =0;i<locationDataGFW.length;i++){
        let directionIndex1 = locationDataGFW[i].lastIndexOf(',')
        let directionIndex2 = locationDataGFW[i].indexOf('°')

        if(locationDataGFW[i].slice(0,10) == tomorrow){
            console.log('GFW tweet if entered ' + i);
            twt.post('statuses/update', { status: 'The #ISS will be visible from Grand Falls tomorrow, '
                + tomorrow
                +', at '
                +locationDataGFW[i].match(regDuration)[0]
                +' '
                +'minutes.'
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
                + '#StJohns #CornerBrook #GFW #GrandFalls #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }
    runWebScrape();
});