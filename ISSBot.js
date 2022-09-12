const fs = require("fs/promises");
const Twit = require("twit");
const cheerio = require("cheerio");
const cron = require("node-cron");
const minimist = require("minimist");
const dotenv = require("dotenv");

dotenv.config();
const argv = minimist(process.argv.slice(2));
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// https://crontab.guru/#0_12_*_*_*
const cronSchedule = "0 12 * * *";


let twt;

if (process.env.ISS_BOT_TWITTER_ENABLED === "true") {
  twt = new Twit({
    consumer_key: process.env.ISS_BOT_TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.ISS_BOT_TWITTER_CONSUMER_SECRET,
    access_token: process.env.ISS_BOT_ACCESS_TOKEN,
    access_token_secret: process.env.ISS_BOT_ACCESS_TOKEN_SECRET,
  });
}

// Regex conditions for finding info in elements of locationData array
const regTime = /(([01]?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/;
const regDuration = /(([0-9]) [m][i][n])/;
const regLocationDegree = /(([0-9])(°) )/;

const getLocation = async (location) => {
  const response = await fetch(
    `https://spotthestation.nasa.gov/sightings/view.cfm?country=Canada&region=Newfoundland&city=${location}`
  );

  const body = await response.text();

  const $ = cheerio.load(body);
  const data = [];
  $("table").each(function () {
    const tr = $(this).next();
    data.push(tr.text().split("|"));
  });

  return data.flat();
};

const getLocations = async () => ({
  "St. Johns": await getLocation("Saint_Johns"),
  "Corner Brook": await getLocation("Corner_Brook"),
  "Grand Falls": await getLocation("Grand_Falls"),
  "Goose Bay": await getLocation("Goose_Bay"),
});

const readLocations = async () => {
  return JSON.parse(await fs.readFile("locations.json", "utf-8"));
};

const writeLocations = async (locations) => {
  await fs.writeFile("locations.json", JSON.stringify(locations, null, 2));
};

const job = async () => {
  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 3);
  console.log(`Running job: Today ${todayDate}, Tomorrow ${tomorrowDate}`);

  const tomorrow = tomorrowDate.toDateString().slice(4, 10);

  var tweetText = '';

  const postUpdate = (locationData, locationName) => {
    console.log(`Posting updates for ${locationName}`);
    for (let i = 0; i < locationData.length; i++) {
      const directionIndex1 = locationData[i].lastIndexOf(",");
      const directionIndex2 = locationData[i].indexOf("°");
      if (locationData[i].slice(26, 32) == tomorrow) {
          tweetText = `The #ISS will be visible from ${locationName} tomorrow, ${tomorrow} at ${locationData[i].match(regTime)[0]} for ${
          locationData[i].match(regDuration)[0]
        }(s)

Location: ${locationData[i].match(regLocationDegree[0])} ${locationData[
          i
        ].slice(directionIndex2 + 2, directionIndex1)}
#StJohns #CornerBrook #GFW #GrandFalls #GooseBay #HVGB #Labrador #Newfoundland #NFLD #explorenl #nlwx #NASA #ISS #SpaceStation #Astronomy`;

        console.log(`Tweet: ${tweetText}`);
        if (twt !== undefined) {
          twt.post("statuses/update", { status: tweetText });
        } else {
          console.log("Twitter disabled, not actually tweeting");
        }
      }
    }
    if(tweetText == ''){
      tweetText = `The #ISS will not be visible from ${locationName} tomorrow, ${tomorrow}.`;
      console.log(tweetText);

      if (twt !== undefined) {
        twt.post("statuses/update", { status: tweetText });
      } else {
        console.log("Twitter disabled, not actually tweeting");
      }
      tweetText =' ';
    }
  };

  const locations = await readLocations();

  Promise.all(
    Object.entries(locations).map(([locationName, locationData]) =>
      postUpdate(locationData, locationName)
    )
  );

  await writeLocations(await getLocations());
};

const main = async () => {
  switch (argv._[0]) {
    case "start-bot":
      console.log(`Starting bot on cron schedule ${cronSchedule}`);
      cron.schedule(cronSchedule, async () => {
        await job();
      });
      break;
    case "run-job":
      await job();
      break;
    case "write-locations":
      await writeLocations(await getLocations());
      break;
    case "read-locations":
      console.log(await readLocations());
      break;
    case "print-locations":
      console.log(await getLocations());
      break;
    default:
      console.error("Unknown / missing argument");
      process.exitCode = 1;
  }
};

main();
