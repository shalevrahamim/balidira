const puppeteer = require("puppeteer");
const { useGPT, ProvidersGPT } = require("./chatgpt");
const DB = require("./db.js");

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
    return {
      text: contentText.concat(frameWrapperText).join(" ").replace(/ +/g, " "),
      images: imgSrcs,
    };
  });

  await browser.close();
  console.log(scrapedText);
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
    type: object.isRoommates ? "rent-roommates" : "rent",
    squareSize: object.squareMeter,
    rooms: object.roomsNumber,
    location: object.location,
    proximity: object.proximity,
    isNotified: false,
    floor: object.floor ? String(object.floor) : null,
    isBroker: object.isBroker,
    contact: object.contact,
    entryDate: object.entryDate,
    moreDetails: object.moreDetails,
    originalContent: post.text,
    originalContentHash: postUrl,
    imagesUrls: post.images,
    postUrl: postUrl,
  };
};

// Usage example
// const websiteUrl = "https://www.yad2.co.il/item/gvxl61q7"; // Replace with the actual URL
// scrapeApartment(websiteUrl);

const apartmentsIds = [];
let page = 1;

const telAviv = 5000;
const ramatGan = 8600;
const ptct = 7900;
const gvtm = 6300;

const scrape = async () => {
  let notFound = false;
  while (!notFound) {
    try {
      const itemIds = await scrapeWebsite(
        `https://www.yad2.co.il/realestate/rent?topArea=2&area=4&city=${ptct}&page=${page}`
      );
      apartmentsIds.push(...itemIds);
      console.log(apartmentsIds);
      if (itemIds.length == 0) {
        notFound = true;
        break;
      }
      page++;
    } catch {}
  }
  console.log("finish", apartmentsIds);
};

scrape().then(async () => {
  const promiseArray = [];
  for (const id of apartmentsIds) {
    try {
      const existingListing = await DB.isListingExist(
        `https://www.yad2.co.il/item/${id}`
      );
      console.log(`https://www.yad2.co.il/item/${id}`, existingListing);
      if (existingListing) continue;
      const scrapedText = await scrapeApartment(
        `https://www.yad2.co.il/item/${id}`
      );
      promiseArray.push(
        preparePost(
          scrapedText,
          "ptct",
          "123",
          `https://www.yad2.co.il/item/${id}`
        )
      );
    } catch {}
  }
  const promiseSettled = await Promise.allSettled(promiseArray);
  const resolvedPromises = promiseSettled.filter(
    (result) => result.status === "fulfilled"
  );
  const resolvedValues = resolvedPromises.map((result) => result.value);
  await DB.createListings(resolvedValues);
});
