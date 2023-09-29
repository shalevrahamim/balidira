const DB = require("./db.js");
const Telegram = require("./telegram.js");
const cron = require("node-cron");
const { scanAllGroups } = require("./puppeteer.js");

const groups = [
  { city: "tlv", url: "https://www.facebook.com/groups/458499457501175/" },
  { city: "tlv", url: "https://www.facebook.com/groups/2092819334342645/" },
  { city: "tlv", url: "https://www.facebook.com/groups/ApartmentsTelAviv/" },
  { city: "tlv", url: "https://www.facebook.com/groups/RentinTLV/" },
  { city: "tlv", url: "https://www.facebook.com/groups/telavivrentals/" },
  { city: "tlv", url: "https://www.facebook.com/groups/1196843027043598/" },
  { city: "rmg", url: "https://www.facebook.com/groups/253957624766723/" },
  { city: "rmg", url: "https://www.facebook.com/groups/2642488706002536/" },
  { city: "rmg", url: "https://www.facebook.com/groups/186810449287215/" },
  { city: "ptct", url: "https://www.facebook.com/groups/248835652321875/" },
  {
    city: "ptct",
    url: "https://www.facebook.com/groups/isaacnadlan.petahtikva/",
  },
  { city: "gvtm", url: "https://www.facebook.com/groups/564985183576779/" },
  { city: "gvtm", url: "https://www.facebook.com/groups/1424244737803677/" },
  { city: "gvtm", url: "https://www.facebook.com/groups/1068642559922565/" },
  { city: "gvtm", url: "https://www.facebook.com/groups/441654752934426/" },
];

const sendMessages = async () => {
  const listings = await DB.getUnNotifiedListings();
  for (const listing of listings) {
    const users = await DB.getMatchingUsersForListing(listing);
    const sendAllUsersPromise = [];
    for (const user of users) {
      sendAllUsersPromise.push(Telegram.sendMessage(user.chat_id, listing));
    }
    await Promise.all(sendAllUsersPromise);
    listing.isNotified = true;
    await listing.save();
  }
};

cron.schedule("00 15 * * *", () => {
  sendMessages();
});

cron.schedule("09 12 * * *", () => {
  try {
    const slicedGroup = groups.slice(0, groups.length / 3);
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("30 13 * * *", () => {
  try {
    const slicedGroup = groups.slice(
      groups.length / 3,
      (groups.length / 3) * 2
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("30 14 * * *", () => {
  try {
    const slicedGroup = groups.slice((groups.length / 3) * 2, groups.length);
    scanAllGroups(slicedGroup);
  } catch {}
});
