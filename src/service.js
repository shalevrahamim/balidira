const DB = require('./db.js');
const Telegram = require('./telegram.js');

const sendMessages = async () => {    
  const listings = await DB.getUnNotifiedListings();
  for(const listing of listings) {
    const users = await DB.getMatchingUsersForListing(listing);
    const sendAllUsersPromise = [];
    for(const user of users) {
        sendAllUsersPromise.push(Telegram.sendMessage(user.chat_id, listing));
    }
    await Promise.all(sendAllUsersPromise);
    listing.isNotified = true;
    await listing.save();
  }
}

setTimeout(()=>{
  sendMessages();
}, 5000)