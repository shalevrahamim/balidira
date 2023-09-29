const puppeteer = require("puppeteer");
const { useGPT } = require("./chatgpt");
const crypto = require("crypto");
const DB = require("./db.js");

// Function to check if the page contains the text "more details" within a div with role="button"
async function containsTextInRoleButton(page, text) {
  const elements = await page.$$('div[role="button"]');
  for (const element of elements) {
    const textContent = await page.evaluate((el) => el.textContent, element);
    if (textContent.includes(text)) {
      try {
        await element.click();
      } catch (err) {
        console.log("err", err);
      }
    }
  }
  return false;
}

async function clickCloseButton(page) {
  try {
    const closeButton = await page.$('div[aria-label="Close"]');
    if (closeButton) {
      await closeButton.click();
      console.log("Clicked the Close button");
    } else {
      console.log("Close button not found");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

const scrapy = async (url) => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to the webpage you want to interact with
    await page.goto(url);
    await page.waitForTimeout(3000);
    await clickCloseButton(page);
    // Wait for the page to load completely
    // await page.waitForNaviation({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.scrollBy(1000, 1000);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.scrollBy(2000, 2000);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.scrollBy(3000, 3000);
    });
    await page.waitForTimeout(2500);

    // If the page contains "more details" within a div with role="button", click on it
    if (await containsTextInRoleButton(page, "See more")) {
      console.log(
        'Clicked on "more details" link within a div with role="button".'
      );
    } else {
      console.log(
        '"More details" link not found within a div with role="button".'
      );
    }

    // Wait for a while to see the result of the click
    await page.waitForTimeout(500); // Adjust the waiting time as needed

    const divSelector = 'div[role="feed"]'; // Selector for the div with role="feed"

    const posts = await page.evaluate(() => {
      const postElements = Array.from(
        document.querySelectorAll('div[role="feed"] > div')
      );

      const postsArray = postElements.map((postElement) => {
        const post = {};

        // Extract text from the post
        post.text = postElement.textContent.trim();

        // Extract URL from the post (contains 'posts' in href)
        const linkElement = postElement.querySelector('a[href*="posts"]');
        if (linkElement) {
          post.url = linkElement.getAttribute("href");
        }

        // Extract image URLs from the post
        const imageElements = postElement.querySelectorAll("img");
        post.images = Array.from(imageElements).map((imageElement) =>
          imageElement.getAttribute("src")
        );

        return post;
      });

      return postsArray;
    });
    await browser.close();
    return posts.filter((post) => post.text != "" && post.images.length > 0);
    // useGPT(filtered[0].text).then((res) => console.log('returned', res));
    // console.log('filtered:', filtered[0].text)
    // console.log(nestedElements.children.map(child => child.text));
    // Close the browser
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

function removeQueryParameters(url) {
  const indexOfQuestionMark = url.indexOf("?");
  if (indexOfQuestionMark !== -1) {
    return url.substring(0, indexOfQuestionMark);
  }
  return url;
}

function hashString(content) {
  const hash = crypto.createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}

const scanAllGroups = async (groups) => {
  for (const group of groups) {
    try {
      await getPosts(group.url, group.city);
    } catch {}
  }
};

const preparePost = async (post, city, hashedText, postUrl) => {
  const object = await useGPT(post.text);
  if(!object)
    return null;
  return {
    price: object.price,
    city: object.city || city,
    provider: "facebook",
    type: object.isRoommates ? 'rent-roommates' : "rent",
    squareSize: object.squareMeter,
    rooms: object.roomsNumber,
    location: object.location,
    proximity: object.proximity,
    floor: object.floor ? String(object.floor) : null,
    isBroker: object.isBroker,
    contact: object.contact,
    entryDate: object.entryDate,
    moreDetails: object.moreDetails,
    originalContent: post.text,
    originalContentHash: hashedText,
    imagesUrls: post.images,
    postUrl: postUrl,
  };
};

const getPosts = async (url, city) => {
  const posts = await scrapy(url);
  const promiseArray = [];
  for (const post of posts) {
    try {
      const hashedText = hashString(post.text);
      const postUrl = removeQueryParameters(post.url);
      const existingListing = await DB.isListingExist(postUrl);
      console.log("isExist", existingListing);
      if (existingListing) continue;
      promiseArray.push(preparePost(post, city, hashedText, postUrl));
    } catch {}
  }
  const promiseSettled = await Promise.allSettled(promiseArray);
  const resolvedPromises = promiseSettled.filter(
    (result) => result.status === "fulfilled"
  );
  const resolvedValues = resolvedPromises.map((result) => result.value);
  await DB.createListings(resolvedValues);
  console.log("posts", posts, posts.length);
};

module.exports.scanAllGroups = scanAllGroups;
