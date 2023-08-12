require('dotenv').config()
const axios = require('axios');

const useGPT = async () => {
    const apiKey = process.env.OPENAI_KEY;
    const endpoint = "https://api.openai.com/v1/engines/text-davinci-003/completions";
    
    const content = "*הורדת מחיר*  בעקבות מעבר לחול מפנה את הדירה שלי אחרי עשר שנים!  דירת קרקע במרכז  ממוקמת בדב הז (פינת גורדון,בין דיזינגוף לבן יהודה) .   קרוב לחוף הים ולכיכר דיזינגוף.     מרכזית ושקטה.   שכירות 6300 לחודש, אין ועד בית, חשבונות נמוכים.   גדולה-כ60 מ״ר. מתאימה לזוג/שותפים.  כניסה וחידוש חוזה ב19/09. ללא תיווך. יש חצר לדירה  וקודן לבניין. הדירה מסורגת.  2 חדרים גדולים- סלון ,חדר שינה, מטבח ,שירותים ומקלחת בנפרד  בעל הדירה מקסים! *תנתן עדיפות*  למי שיקנה את  הריהוט של הבית/חלקו.  מראה הסופש ובראשון. לתיאום ופרטים נוספים בפרטי מרום 0548161226";
    const prompt = 'Translate the following English text to Hebrew: "Hello, how are you?"';


    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    
    const requestData = JSON.stringify({
        prompt,
       // prompt: `Generate a JavaScript object from the following content: ${content}\n\nProperties needed include: {price, squareMeter, location, proximity, description}`,
        max_tokens: 1000,
    });
    
    
// Make the API request
    fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: requestData,
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response JSON object
      console.log(data);
      // Parse the generated text as a JavaScript object
      const generatedObject = JSON.parse(data.choices[0].text);
      console.log("****************")
      console.log(generatedObject);
      // Now you can access the properties of the generated object
      const { price, squareMeter, location, proximity, description } = generatedObject;
      console.log(price, squareMeter, location, proximity, description);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

useGPT()

module.exports = {useGPT}