const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');
const fs = require('fs');


const data = [];
const getLocation = async () => {
    // get html text from ISS
    const response = await fetch('https://spotthestation.nasa.gov/sightings/view.cfm?country=Canada&region=Newfoundland&city=Saint_Johns#.YmhIZdPMK5c')
    // using await to ensure that the promise resolves
    const body = await response.text();
  
    // parse the html text and extract location data
    const $ = cheerio.load(body);
    
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

run();

async function run(){
console.log(await getLocation());
}



