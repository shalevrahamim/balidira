const DB = require("./db.js");
const Telegram = require("./telegram.js");
const cron = require("node-cron");
const { scanAllGroups } = require("./puppeteer.js");

const groups = [
  { city: "tlv", url: "https://www.facebook.com/groups/458499457501175/" },
  { city: "tlv", url: "https://www.facebook.com/groups/287564448778602/" },
  { city: "tlv", url: "https://www.facebook.com/groups/295395253832427/" },
  { city: "tlv", url: "https://www.facebook.com/groups/RentinTLV/" },
  { city: "tlv", url: "https://www.facebook.com/groups/telavivrentals/" },
  { city: "tlv", url: "https://www.facebook.com/groups/174312609376409/" },
  { city: "tlv", url: "https://www.facebook.com/groups/ApartmentsTelAviv/" },
  { city: "tlv", url: "https://www.facebook.com/groups/184920528370332/" },
  { city: "tlv", url: "https://www.facebook.com/groups/2092819334342645/" },
  { city: "tlv", url: "https://www.facebook.com/groups/202530744012050/" },
  { city: "tlv", url: "https://www.facebook.com/groups/191591524188001/" },
  { city: "tlv", url: "https://www.facebook.com/groups/305724686290054/" },
  { city: "tlv", url: "https://www.facebook.com/groups/1374467126144215/" },
  { city: "tlv", url: "https://www.facebook.com/groups/426607440821568/" },
  { city: "tlv", url: "https://www.facebook.com/groups/1749183625345821/" },
  { city: "tlv", url: "https://www.facebook.com/groups/685761804836723/" },
  { city: "tlv", url: "https://www.facebook.com/groups/141136760102682/" },
  { city: "tlv", url: "https://www.facebook.com/groups/1196843027043598/" },
  { city: "rmg", url: "https://www.facebook.com/groups/253957624766723/" },
  { city: "rmg", url: "https://www.facebook.com/groups/2642488706002536/" },
  { city: "rmg", url: "https://www.facebook.com/groups/1870209196564360/" },
  { city: "rmg", url: "https://www.facebook.com/groups/1642168479433463/" },
  { city: "rmg", url: "https://www.facebook.com/groups/186810449287215/" },
  { city: "rmg", url: "https://www.facebook.com/groups/DIRARAMATGAN/" },
  { city: "rmg", url: "https://www.facebook.com/groups/1424244737803677/" },
  { city: "rmg", url: "https://www.facebook.com/groups/1068642559922565/" },
  { city: "rmg", url: "https://www.facebook.com/groups/441654752934426/" },
  { city: "ptct", url: "https://www.facebook.com/groups/248835652321875/" },
  {
    city: "ptct",
    url: "https://www.facebook.com/groups/isaacnadlan.petahtikva/",
  },
  { city: "ptct", url: "https://www.facebook.com/groups/528900388065039/" },
  { city: "ptct", url: "https://www.facebook.com/groups/193144908049168/" },
  { city: "ptct", url: "https://www.facebook.com/groups/716258928467864/" },
  { city: "ptct", url: "https://www.facebook.com/groups/436129093818279/" },
  { city: "gvtm", url: "https://www.facebook.com/groups/564985183576779/" },
  { city: "gvtm", url: "https://www.facebook.com/groups/2098391913533248/" },
  { city: "gvtm", url: "https://www.facebook.com/groups/692882024975122/" },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sendMessages = async () => {
  const listings = await DB.getUnNotifiedListings();
  for (const listing of listings) {
    const users = await DB.getMatchingUsersForListing(listing);
    const sendAllUsersPromise = [];
    for (const user of users) {
      sendAllUsersPromise.push(Telegram.sendMessage(user.chat_id, listing));
      await delay(300);
    }
    await Promise.all(sendAllUsersPromise);
    listing.isNotified = true;
    await listing.save();
    if (users.length != 0) await delay(1000);
  }
};

// cron.schedule("15 19 * * *", async () => {
//   const users = await DB.getAllUsers();
//   for (const user of users) {
//     Telegram.sendCustomMessage(user.chat_id, `שבוע טוב ${user?.preferences?.name},\n לא לדאוג אני כאן ובקרוב אשלח לך כמה דירות שמצאתי\n\nאתי`);
//     await delay(100);
//   }
// });

cron.schedule("37 19 * * *", () => {
  sendMessages();
});

cron.schedule("00 14 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test1");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 2,
      (groups.length / 9) * 3
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("00 15 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test2");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 3,
      (groups.length / 9) * 4
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("00 16 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test3");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 4,
      (groups.length / 9) * 5
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("00 17 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test4");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 5,
      (groups.length / 9) * 6
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("00 18 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test5");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 6,
      (groups.length / 9) * 7
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("48 18 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test6");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 7,
      (groups.length / 9) * 8
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

cron.schedule("30 19 * * *", () => {
  try {
    Telegram.sendCustomMessage("334337635", "test7");
    const slicedGroup = groups.slice(
      (groups.length / 9) * 8,
      (groups.length / 9) * 9
    );
    scanAllGroups(slicedGroup);
  } catch {}
});

Telegram.sendCustomMessage("334337635", "started");
