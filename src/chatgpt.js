require("dotenv").config();
const { OpenAI } = require("openai");

const yad2Example = `יהודה עמיחי 6 תכנית ל', למד, תל אביב יפו 4 חדרים7 קומה125 מ"ר 13,500 ₪ על הנכס דירת 4 חדרים קומה גבוהה. 110 מר פלוס שתי חניות ומחסן. מרחק הליכה קצרה מהים. 
משופצת (ממש לאחרונה) אסטטית, מרווחת ומוארת.
בנוסף, מרפסת שמש 15 מר, דרום מערבית צופה לים. שכנים נחמדים
 סה״כ תשלום חודשי
 15,100 ₪
 מצב הנכס

 משופץ

 תאריך כניסה

 כניסה מיידית

 מ"ר בנוי

 110

 מ"ר בנוי סה"כ

 125

 ועד בית (לחודש)

 650 ₪

 מרפסות

 1

 קומות בבנין

 8

 מס תשלומים

 12

 ארנונה לחודשיים

 1,900 ₪

 חניות

 2`;

const yad2Result = `{"price": 13500, "isRoommates": false, "city": "tlv", "squareMeter": 125, "roomsNumber": 4, "location": "יהודה עמיחי 6 תכנית ל', למד", "proximity": "מרחק הליכה קצרה מהים", "floor": 7, "isBroker": false, "contact": null, "entryDate": "כניסה מיידית"}`;

const ProvidersGPT = { yad2: "yad2", facebook: "facebook" };

const useGPT = async (content, provider) => {
  console.log(content, provider);
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
      content: `I will give you aparment listing content and you will extract the following properties.\nrules: remove double quetes from text. returned value should be valid json.\nreturned object structure: {price:integer, squareMeter:integer, roomsNumber:double, location:string, isRoommates: boolean, city:string, proximity:string, floor:string, isBroker:boolean, contact:string, entryDate:string}.\ndefault values: {price:null, squareMeter:null, roomsNumber:null, location:null, city:(רמת גן = rmg, תל אביב = tlv, גבעתיים = gvtm, פתח תקווה = ptct if not exist then null), floor:null, proximity:null, isRoommates: false, isBroker:false, contact:null, entryDate:null}.\n this is the listing: ${
        provider == ProvidersGPT.yad2 ? yad2Example : contentExample
      }`,
    },
    {
      role: "assistant",
      content:
        provider == ProvidersGPT.yad2
          ? yad2Result
          : '{"price": 6300, "isRoommates": false, "city": "tlv", "squareMeter": 60, "roomsNumber": 2.5, "location": "דפינת גורדון,בין דיזינגוף לבן יהודה", "proximity": "קרוב לחוף הים ולכיכר דיזינגוף", "floor": 0, "isBroker": false, "contact": "0548161226 מרום", "entryDate": "19/09""}',
    },
    { role: "user", content: `${content}` },
  ];

  console.log("gpt start");
  console.log(conversation);
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Use the "model" parameter instead of "engine"
    messages: conversation,
    max_tokens: 800,
  });
  console.log("gpt end");
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

module.exports = { useGPT, ProvidersGPT };
