require('dotenv').config() // Load .env file
const axios = require('axios')
const Discord = require('discord.js')
const client = new Discord.Client()

function getPrices() {

	// API magiceden for floorprice data.
	axios
    .get(
      `api-mainnet.magiceden.dev/v2/collections/${process.env.NAME}/stats`
    )
    .then((res) => {
      // If we got a valid response
      if (res.data && res.data[0].floorPrice && res.data[0].listedCount) {
        let floorPrice1 = res.data[0].floorPrice || 0; // Default to zero
        let listedCount1 = res.data[0].listedCount || 0; // Default to zero
        client.user.setPresence({
          game: {
            // Example: "Watching -5,52% | BTC"
            name: `${listedCount1.toFixed(2)}% | ${process.env.CHAIN.toUpperCase()}`,
            type: 3, // Use activity type 3 which is "Watching"
          },
        });

        client.guilds
          .find((guild) => guild.id === process.env.SERVER_ID)
          .me.setNickname(
            `${floorPrice1
              .toLocaleString()
              .replace(/,/g, process.env.THOUSAND_SEPARATOR)}${
              process.env.CURRENCY_SYMBOL
            }`
          );

        console.log("Updated floorprice to", floorPrice1);
      } else
        console.log(
          "Could not load player count data for",
          process.env.NAME
        );
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
