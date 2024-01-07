const puppeteer = require("puppeteer");
const { useGPT, ProvidersGPT } = require("./chatgpt");
const crypto = require("crypto");
const DB = require("./db.js");

const telAviv = {cityKey: 'tlv', cityCode: 5000,area:1, topArea: 2};
const ramatGan = {cityKey: 'rmg',cityCode: 8600,area:3, topArea: 2}
const ptct = {cityKey: 'ptct',cityCode: 7900,area:4, topArea: 2};
const gvtm = {cityKey: 'gvtm',cityCode: 6300,area:3, topArea: 2};
const rzion = {cityKey: 'rzion',cityCode: 8300,area:9, topArea: 2};

const cities = [telAviv, ramatGan, ptct, gvtm]

async function scrapeWebsite(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);

  // Wait for the page to load completely and the target elements to be available
  await page.waitForSelector(".feed_list");
  await page.waitForSelector(".feed_list .feeditem.table");

  const feedItems = await page.evaluate(() => {
    const feedList = document.querySelector(".feed_list");
    const feedItemElements = feedList.querySelectorAll(".feeditem.table");

    const feedItemIds = [];

    feedItemElements.forEach((feedItem) => {
      if (feedItem.textContent.includes("עודכן היום")) {
        const itemId = feedItem
          .querySelector(".feed_item")
          .getAttribute("item-id");
        feedItemIds.push(itemId);
      }
    });

    return feedItemIds;
  });

  await browser.close();

  return feedItems;
}

async function scrapeApartment(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);

  // Wait for the page to load completely and the target elements to be available
  await page.waitForSelector(".ad_about");
  await page.waitForSelector(".wrapper_content");

  const scrapedText = await page.evaluate(() => {
    const swiperSlides = document.querySelectorAll(".swiper-slide");
    const imgSrcs = [];

    swiperSlides.forEach((swiperSlide) => {
      const imgElement = swiperSlide.querySelector("img");
      if (imgElement) {
        const imgSrc = imgElement.getAttribute("src");
        imgSrcs.push(imgSrc);
      }
    });

    const frameWrapperText = Array.from(
      document.querySelectorAll(".ad_about")
    ).map((element) => element.textContent.trim());

    const contentText = Array.from(
      document.querySelectorAll(".wrapper_content")
    ).map((element) => element.textContent.trim());

    const infoFeatureDivs = Array.from(document.querySelectorAll('.info_feature:not(.delete)'));
    const infoText = infoFeatureDivs.map(div => div.textContent.trim()).join(', ');
    console.log('infoText', infoText)
    return {
      text: contentText.concat(frameWrapperText).join(" ").replace(/ +/g, " ").concat('\nבדירה קיים: ' + infoText),
      images: imgSrcs.slice(0, 3),
      infoText
    };
  });

  await browser.close();
  return scrapedText;
}

const preparePost = async (post, city, hashedText, postUrl) => {
  const object = await useGPT(post.text, ProvidersGPT.yad2);
  if (!object) return null;
  if (!object.price || !object.roomsNumber) return null;
  return {
    price: object.price,
    city: object.city || city,
    provider: "yad2",
    type: "rent",
    squareSize: object.squareMeter,
    rooms: object.roomsNumber,
    location: object.location,
    proximity: object.proximity,
    isNotified: false,
    floor: object.floor ? String(object.floor) : null,
    isBroker: object.isBroker,
    isRoommates: object.isRoommates,
    contact: object.contact,
    entryDate: object.entryDate,
    moreDetails: object.moreDetails,
    originalContent: post.text,
    airConditioner: object.airConditioner,
    elevator: object.elevator,
    renovated: object.renovated,
    disabledAccess: object.disabledAccess,
    MMD: object.MMD,
    storageRoom: object.storageRoom,
    animals: object.animals,
    equipment: object.equipment,
    balcony: object.balcony,
    parking: object.parking,
    immediateEntry: object.immediateEntry,
    originalContentHash: postUrl,
    imagesUrls: post.images,
    postUrl: postUrl,
  };
};

// Usage example
// const websiteUrl = "https://www.yad2.co.il/item/gvxl61q7"; // Replace with the actual URL
// scrapeApartment(websiteUrl);



const scrape = async (city) => {
  const apartmentsIds = [];
  let page = 1;
  let notFound = false;
  while (!notFound) {
    try {
      const itemIds = await scrapeWebsite(
        `https://www.yad2.co.il/realestate/rent?topArea=${city.topArea}&area=${city.area}&city=${city.cityCode}&page=${page}`
      );
      apartmentsIds.push(...itemIds);
      if (itemIds.length == 0) {
        notFound = true;
        break;
      }
      page++;
    } catch {}
  }
  return apartmentsIds;
};

(async ()=>{
  const total = {};
  for(const city of cities){
    total[city.cityCode] = {new: 0, exist: 0};
    const apartmentsIds = await scrape(city);
    for (const id of apartmentsIds) {
      try {
        const existingListing = await DB.isListingExist(
          `https://www.yad2.co.il/item/${id}`
        );
        if (existingListing) {
          total[city.cityCode]['exist'] += 1; 
          continue;
        }
        total[city.cityCode]['new'] += 1;
        const scrapedText = await scrapeApartment(
          `https://www.yad2.co.il/item/${id}`
        );
        prepareAndSaveScrape(id, scrapedText, city.cityKey);
      } catch {}
    }
  }
  console.log('total', total)
})()

function hashString(content) {
  const hash = crypto.createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}

const prepareAndSaveScrape = async (itemId, scrapedObject, cityKey) => {
  const post = await preparePost(
    scrapedObject,
    cityKey,
    hashString(scrapedObject.text),
    `https://www.yad2.co.il/item/${itemId}`
  );
  console.log('post', post)
  await DB.createListings([post]);
}