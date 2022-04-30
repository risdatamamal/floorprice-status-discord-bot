require('dotenv').config() // Load .env file
const axios = require('axios')
const Discord = require('discord.js')
const client = new Discord.Client()

function getPrices() {

  // API magiceden for floorprice data.
  axios
    .get(
      `https://api-mainnet.magiceden.dev/v2/collections/${process.env.NAME}/stats`
    )
    .then((res) => {
      // If we got a valid response
      if (res.data && res.data.floorPrice && res.data.listedCount) {
        let floorPriceNew = res.data.floorPrice || 0; // Default to zero
        let listedCountNew = res.data.listedCount || 0; // Default to zero
        client.user.setPresence({
          game: {
            // Example: "Watching Listed: 141"
            name: `Listed: ${listedCountNew}`,
          },
        });

        client.guilds
          .find((guild) => guild.id === process.env.SERVER_ID)
          .me.setNickname(
            `FP: ${floorPriceNew
              .toLocaleString()
              .substring(0, 5)
              .replace(/,/g, process.env.THOUSAND_SEPARATOR)}${
              process.env.CURRENCY_SYMBOL
            }`
          );

        

        console.log("Updated Floorprice to", floorPriceNew);
      } else
        console.log("Could not load player count data for", process.env.NAME);
    })
    .catch((err) =>
      console.log("Error at api-mainnet.magiceden.dev data:", err)
    );

}

// Runs when client connects to Discord.
client.on('ready', () => {
	console.log('Logged in as', client.user.tag)

	getPrices() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getPrices, Math.max(1, process.env.UPDATE_FREQUENCY || 1) * 60 * 1000)
})

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
