require("dotenv").config();
const { OpenAI } = require("openai");
const axios = require("axios");

const a =
  "\n" +
  "\n" +
  "\n" +
  "\n" +
  "{\n" +
  'price: "6300",\n' +
  'squareMeter: "60",\n' +
  'location: "דב הז (פינת גורדון,בין דיזינגוף לבן יהודה)",\n' +
  'proximity: "קרוב לחוף הים ולכיכר דיזינגוף"\n' +
  "}";

const useGPT = async (content) => {
  console.log(content);
  const apiKey = process.env.OPENAI_KEY;
  const contentExample =
    "*הורדת מחיר*  בעקבות מעבר לחול מפנה את הדירה שלי בתל אביב אחרי עשר שנים! דירת קרקע במרכז ממוקמת בדב הז (פינת גורדון,בין דיזינגוף לבן יהודה). קרוב לחוף הים ולכיכר דיזינגוף. מרכזית ושקטה. שכירות ₪6,300 שח לחודש, אין ועד בית, חשבונות נמוכים. גדולה-כ60 מ״ר. מתאימה לזוג/שותפים. כניסה וחידוש חוזה ב19/09. ללא תיווך. יש חצר לדירה  וקודן לבניין. הדירה מסורגת. שתיים וחצי חדרים גדולים- סלון ,חדר שינה, מטבח ,שירותים ומקלחת בנפרד  בעל הדירה מקסים! *תנתן עדיפות*  למי שיקנה את  הריהוט של הבית/חלקו.  מראה הסופש ובראשון. לתיאום ופרטים נוספים בפרטי מרום 0548161226";

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const conversation = [
    {
      role: "system",
      content: "You are a data extractor that convert text to json.",
    },
    {
      role: "user",
      content: `I will give you aparment listing content and you will extract the following properties.\nrules: remove double quetes from text. returned value should be valid json.\nreturned object structure: {price:integer, squareMeter:integer, roomsNumber:double, location:string, isRoommates: boolean, city:string, proximity:string, floor:string, isBroker:boolean, contact:string, entryDate:string}.\ndefault values: {price:null, squareMeter:null, roomsNumber:null, location:null, city:(רמת גן = rmg, תל אביב = tlv, גבעתיים = gvtm, פתח תקווה = ptct if not exist then null), floor:null, proximity:null, isRoommates: false, isBroker:false, contact:null, entryDate:null}.\n this is the listing: ${contentExample}`,
    },
    {
      role: "assistant",
      content:
        '{"price": 6300, "isRoommates": false, "city": "tlv", "squareMeter": 60, "roomsNumber": 2.5, "location": "דפינת גורדון,בין דיזינגוף לבן יהודה", "proximity": "קרוב לחוף הים ולכיכר דיזינגוף", "floor": 0, "isBroker": false, "contact": "0548161226 מרום", "entryDate": "19/09""}',
    },
    { role: "user", content: `${content}` },
  ];

  console.log("gpt start");
  console.log(conversation)
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Use the "model" parameter instead of "engine"
    messages: conversation,
    max_tokens: 800,
  });
  console.log("gpt end");

  //     const endpoint = "https://api.openai.com/v1/engines/text-davinci-003/completions";

  //     const prompt = 'Translate the following English text to Hebrew: "Hello, how are you?"';

  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${apiKey}`,
  //     };

  //     const requestData = JSON.stringify({
  //        // prompt,
  //         // prompt: `Generate a JavaScript object from the following content: ${content}\n\nProperties needed include: {price, squareMeter, location, proximity, description}`,
  //         prompt: `act like a data extractor. I will give you aparment listing content and you will extract the following properties: {price, squareMeter, roomsNumber, location, proximity, moreDetails}. return valid json each propery and value should wrap with double quotes. this is the listing: ${content}`,

  //         max_tokens: 1000,
  //     });

  // // Make the API request
  //     const result = await fetch(endpoint, {
  //         method: 'POST',
  //         headers: headers,
  //         body: requestData,
  //     });
  //     const data = await result.json();

  //       // Handle the response JSON object
  //       console.log(data);
  console.log(response.usage);

  console.log(parseObjectString(response.choices[0].message.content));
  return parseObjectString(response.choices[0].message.content);
};

function parseObjectString(inputString) {
  try {
    const cleanedString = inputString
      .replace(/\s+/g, " ") // Replace consecutive spaces with a single space
      .replace(/\\n/g, ""); // Remove escaped newlines
    const objectString = cleanedString.match(/\{(.|\n)*\}/)[0]; // Extract the object part using regex
    console.log("objectString", objectString);
    const parsedObject = JSON.parse(objectString); // Parse the extracted object

    return parsedObject;
  } catch (error) {
    console.error("Error parsing object string:", error);
    return null;
  }
}

const content =
  "*הורדת מחיר*  בעקבות מעבר לחול מפנה את הדירה שלי אחרי עשר שנים!  דירת קרקע במרכז  ממוקמת בדב הז (פינת גורדון,בין דיזינגוף לבן יהודה) .   קרוב לחוף הים ולכיכר דיזינגוף.     מרכזית ושקטה.   שכירות 6300 לחודש, אין ועד בית, חשבונות נמוכים.   גדולה-כ60 מ״ר. מתאימה לזוג/שותפים.  כניסה וחידוש חוזה ב19/09. ללא תיווך. יש חצר לדירה  וקודן לבניין. הדירה מסורגת.  2 חדרים גדולים- סלון ,חדר שינה, מטבח ,שירותים ומקלחת בנפרד  בעל הדירה מקסים! *תנתן עדיפות*  למי שיקנה את  הריהוט של הבית/חלקו.  מראה הסופש ובראשון. לתיאום ופרטים נוספים בפרטי מרום 0548161226";

//  console.log(a)
//parseObjectString(a)

module.exports = { useGPT };
