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


const job = schedule.scheduleJob('*/1 * * * *'/*{hour: 12, minute: 00}*/, function() {
    console.log('Running program.')
    const getLocation = async () => {
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
        
        fs.writeFile('locData.txt',data.toString(), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })
        
    }

    async function runWebScrape(){
    console.log(await getLocation());
    }

    /**
     * readData reads from a .txt file containing ISS location data for the next 15 days
     * @returns String of location data
     */
    function readData(){
        try {
            const data = fs.readFileSync('C:\\Users\\keena\\Documents\\JavaScript\\locData.txt', 'utf8');
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
    let locationData = readData().split("|");

    /**
     * Matches tomorrows date with element of locationData, tweets the ISS location data for tomorrows date
     */
    for(let i =0;i<locationData.length;i++){
        let directionIndex1 = locationData[i].lastIndexOf(',')
        let directionIndex2 = locationData[i].indexOf('°')

        if(locationData[i].slice(0,10) == tomorrow){
            console.log('tweet if entered ' + i);
            twt.post('statuses/update', { status: 'The #ISS will be visible from St. Johns tomorrow, '
                + tomorrow
                +', at '
                +locationData[i].match(regTime)[0]
                +' for '
                +locationData[i].match(regDuration)[0]
                +' '
                +'minutes.'
                +'\n'
                +'\n'
                +'Location: '
                +locationData[i].match(regLocationDegree[0])
                +' '
                +locationData[i].slice(directionIndex2 +2, directionIndex1)
                +'\n'
                +'\n'
                +'\n'
                +'\n'
                + '#StJohns #Newfoundland #NFLD #explorenl #NASA #ISS #SpaceStation #Astronomy'
            });
        }
    }

    runWebScrape();
});