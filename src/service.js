require('dotenv').config()
const DB = require("./db.js");
const Telegram = require("./telegram.js");

const cron = require("node-cron");
// const { scanAllGroups } = require("./puppeteer.js");
const { format } = require("date-fns");
// const groups = [
//   { city: "tlv", url: "https://www.facebook.com/groups/458499457501175/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/287564448778602/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/295395253832427/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/RentinTLV/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/telavivrentals/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/174312609376409/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/ApartmentsTelAviv/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/184920528370332/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/2092819334342645/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/202530744012050/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/191591524188001/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/305724686290054/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/1374467126144215/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/426607440821568/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/1749183625345821/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/685761804836723/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/141136760102682/" },
//   { city: "tlv", url: "https://www.facebook.com/groups/1196843027043598/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/253957624766723/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/2642488706002536/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/1870209196564360/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/1642168479433463/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/186810449287215/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/DIRARAMATGAN/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/1424244737803677/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/1068642559922565/" },
//   { city: "rmg", url: "https://www.facebook.com/groups/441654752934426/" },
//   { city: "ptct", url: "https://www.facebook.com/groups/248835652321875/" },
//   {
//     city: "ptct",
//     url: "https://www.facebook.com/groups/isaacnadlan.petahtikva/",
//   },
//   { city: "ptct", url: "https://www.facebook.com/groups/528900388065039/" },
//   { city: "ptct", url: "https://www.facebook.com/groups/193144908049168/" },
//   { city: "ptct", url: "https://www.facebook.com/groups/716258928467864/" },
//   { city: "ptct", url: "https://www.facebook.com/groups/436129093818279/" },
//   { city: "gvtm", url: "https://www.facebook.com/groups/564985183576779/" },
//   { city: "gvtm", url: "https://www.facebook.com/groups/2098391913533248/" },
//   { city: "gvtm", url: "https://www.facebook.com/groups/692882024975122/" },
// ];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const createMatchListings = async () => {
  const listings = await DB.getUnNotifiedListings();
  const allUsers = {};
  const userNames = {};
  for (const listing of listings) {
    const users = await DB.getMatchingUsersForListing(listing);
    // const users = [{chat_id: '334337635', preferences: {name: 'shalev'}}]
    for (const user of users) {
      if (!allUsers[user.chat_id]) {
        allUsers[user.chat_id] = [];
      }
      userNames[user.chat_id] = user.preferences.name;
      allUsers[user.chat_id].push({
        listingId: listing.id,
        isNotified: false,
      });
    }
    listing.isNotified = true;
    listing.save();
  }
  const formattedDate = format(Date.now(), "yyyy.MM.dd");
  const matchesListings = [];
  for (const chatId in allUsers) {
    matchesListings.push({
      period: formattedDate,
      chat_id: chatId,
      listings: allUsers[chatId],
    });
  }
  DB.createMatchListings(matchesListings);
  for (const match of matchesListings) {
    console.log(userNames[match.chat_id]);
    await Telegram.sendTotalFoundMessage(userNames[match.chat_id], match);
  }
};

// createMatchListings();

// cron.schedule("47 16 * * *", async () => {
const anoucement = async () =>{
    const users = await DB.getAllUsers();
    for (const user of users) {
      Telegram.sendCustomMessage(
        user.chat_id,
        `היי <b>${user?.preferences?.name}</b>, אני חוזרת לעבוד בצורה מלאה ובכל הכוח, בקרוב אשלח לך דירות שמצאתי בשבילך, לבינתיים אני רוצה לאחל לך שנדע רק בשורות טובות, שקט ושחיילנו יחזרו בשלום לביתם`
      );
      await delay(100);
  }
}

// });

// cron.schedule("05 21 * * *", () => {
//   createMatchListings();
// });

// cron.schedule("10 21 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test1");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 0,
//       (groups.length / 9) * 1
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// cron.schedule("13 21 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test1");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 1,
//       (groups.length / 9) * 2
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// cron.schedule("04 17 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test1");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 2,
//       (groups.length / 9) * 3
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// cron.schedule("57 15 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test2");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 3,
//       (groups.length / 9) * 4
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// cron.schedule("43 14 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test3");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 4,
//       (groups.length / 9) * 5
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// cron.schedule("33 13 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test4");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 5,
//       (groups.length / 9) * 6
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// cron.schedule("24 12 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test5");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 6,
//       (groups.length / 9) * 7
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });

// // cron.schedule("05 11 * * *", () => {
// //   try {
// //     Telegram.sendCustomMessage("334337635", "test6");
// //     const slicedGroup = groups.slice(
// //       (groups.length / 9) * 7,
// //       (groups.length / 9) * 8
// //     );
// //     scanAllGroups(slicedGroup);
// //   } catch {}
// // });

// cron.schedule("15 10 * * *", () => {
//   try {
//     Telegram.sendCustomMessage("334337635", "test7");
//     const slicedGroup = groups.slice(
//       (groups.length / 9) * 8,
//       (groups.length / 9) * 9
//     );
//     scanAllGroups(slicedGroup);
//   } catch {}
// });
Telegram.sendCustomMessage("2073551658", "hello shemesh");

// anoucement()