const puppeteer = require('puppeteer');


(async () => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({headless: false});
    
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to the webpage you want to interact with
    await page.goto('https://he-il.facebook.com/groups/295395253832427'); // Replace 'https://example.com' with the actual URL
    await page.waitForTimeout(2000);

    // Wait for the page to load completely
    //await page.waitForNaviation({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollBy(1000, 1000);
    });
    await page.waitForTimeout(1500);

    await page.evaluate(() => {
      window.scrollBy(2000, 2000);
    });
    await page.waitForTimeout(2500);

    await page.evaluate(() => {
      window.scrollBy(3000, 3000);
    });
    await page.waitForTimeout(2000);

    // Function to check if the page contains the text "more details" within a div with role="button"
    async function containsTextInRoleButton(page, text) {
      const elements = await page.$$('div[role="button"]');
      for (const element of elements) {
        const textContent = await page.evaluate(el => el.textContent, element);
      
        if (textContent.includes(text)) {
          try{
            await element.click();
          }
          catch(err){
            console.log('err', err);
          }
        }
      }
      return false;
    }

    // If the page contains "more details" within a div with role="button", click on it
    if (await containsTextInRoleButton(page, 'עוד')) {
      console.log('Clicked on "more details" link within a div with role="button".');
    } else {
      console.log('"More details" link not found within a div with role="button".');
    }

    // Wait for a while to see the result of the click
    await page.waitForTimeout(25000); // Adjust the waiting time as needed










    const divSelector = 'div[role="feed"]'; // Selector for the div with role="feed"
    await page.waitForTimeout(15000);
  
    const nestedElements = await page.evaluate((selector) => {
      const feedDiv = document.querySelector(selector);
  
      if (!feedDiv) {
        return [];
      }
  
      const processElement = (element) => {
        const obj = {
          text: element.textContent.trim(),
          children: Array.from(element.children).map(processElement),
        };
  
        return obj;
      };
  
      return processElement(feedDiv);
    }, divSelector);
  
    console.log(nestedElements);
  









    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();




















// async function scrapeNestedElements() {
//   const browser = await puppeteer.launch({headless: false});
//   const page = await browser.newPage();

//   await page.goto('https://he-il.facebook.com/groups/295395253832427'); // Replace with the URL of the page containing the div you want to extract text from.

//   const divSelector = 'div[role="feed"]'; // Selector for the div with role="feed"
//   await page.waitForTimeout(15000);

//   const nestedElements = await page.evaluate((selector) => {
//     const feedDiv = document.querySelector(selector);

//     if (!feedDiv) {
//       return [];
//     }

//     const processElement = (element) => {
//       const obj = {
//         text: element.textContent.trim(),
//         children: Array.from(element.children).map(processElement),
//       };

//       return obj;
//     };

//     return processElement(feedDiv);
//   }, divSelector);

//   console.log(nestedElements);

//   await browser.close();
// }

// scrapeNestedElements();
