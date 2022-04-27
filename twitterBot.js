const twit = require('twit');
const fs = require('fs');

/**
 * Auth info
 */
var twt = new twit({
    consumer_key : '',
    consumer_secret : '',
    access_token : '',
    access_token_secret : ''
    });

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

//todays date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy+'-'+mm+'-'+dd;

//Creates an array of the location data separated by day
let locationData = readData().split("|");

//Regex conditions for finding info in elements of locationData array
const regTime = /(([01]?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/;
const regDuration = /(([0-9]))/;
const regLocationDegree = /(([0-9])(°) )/;

/**
 * Matches todays date with element of locationData, tweets the ISS location data for todays date
 */
for(let i =0;i<locationData.length;i++){
    let directionIndex1 = locationData[i].lastIndexOf(',')
    let directionIndex2 = locationData[i].indexOf('°')

    if(locationData[i].slice(0,10) == today){

        twt.post('statuses/update', { status: 'The #ISS will be visible from St. Johns today at '  
            + locationData[i].match(regTime)[0]
            + ' for '
            + locationData[i].match(regDuration)[0]
            +' '
            +'minutes'
            +'\n'
            +'\n'
            +'location: '
            +locationData[i].match(regLocationDegree[0])
            +' '
            + locationData[i].slice(directionIndex2 +2, directionIndex1)
            +'\n'
            +'\n'
            +'\n'
            +'\n'
            + '#ISS #StJohns #Newfoundland #NFLD #NASA '
        })    
    }
}
