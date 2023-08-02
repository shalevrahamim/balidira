const TelegramBot = require('node-telegram-bot-api');
const translation = require('./translation.js');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = '';
const bot = new TelegramBot(botToken, { polling: true });
// States for conversation
const states = {
    WELCOME: 0,
    NAME: 1,
    CITY: 2,
    CITY_MULTISELECT: 3,
    ROOMS: 4,
    PRICE: 5
};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  console.log(messageText)
  switch (messageText) {
    case '/start':
      const options = {
        reply_markup: {
          inline_keyboard: [[{ text: 'ברור!', callback_data: 'yes' }]]
        },
      };
        bot.sendMessage(chatId, translation.welcome, options);
        break;
    default:
      // Process user input based on the current state
      processUserInput(chatId, messageText);
      break;
  }
});

function getUpdatedInlineKeyboard(selectedOption) {
    const options = [
        { text: 'Red', callback_data: 'red' },
        { text: 'Blue', callback_data: 'blue' },
        { text: 'Green', callback_data: 'green' },
        { text: 'Yellow', callback_data: 'yellow' },
      // Add more options as needed
    ];
  
    // Update the text of the selected option
    options.forEach((option) => {
      if (option.callback_data === selectedOption) {
        option.text = `Selected: ${option.text}`;
      }
    });
  
    const inlineKeyboard = {
          inline_keyboard: [
            [{ text: 'Red 1', callback_data: 'red' }],
            [{ text: 'Blue', callback_data: 'blue' }],
            [{ text: 'Green', callback_data: 'green' }],
            [{ text: 'Yellow', callback_data: 'yellow' }],
            ],
        
    };
  
    return inlineKeyboard;
  }
  

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const selectedOption = query.data;
    const currentState = chatStates[chatId].state;

    switch(currentState){
      case states.WELCOME:
        if(selectedOption == "yes"){
          const options = {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Red', callback_data: 'red' }],
                [{ text: 'Blue', callback_data: 'blue' }],
                [{ text: 'Green', callback_data: 'green' }],
                [{ text: 'Yellow', callback_data: 'yellow' }],
              ],
            },
          };
        
        bot.sendMessage(chatId, translation.whichCity, options);
        chatStates[chatId].state = states.CITY_MULTISELECT;
        }
        break;
      case states.CITY_MULTISELECT:
        const updatedInlineKeyboard = getUpdatedInlineKeyboard(selectedOption);
        bot.editMessageReplyMarkup(updatedInlineKeyboard, {
            chat_id: chatId,
            message_id: query.message.message_id,
        });
        break;
    }

});

// Function to process user input based on the current state
const processUserInput = (chatId, messageText) => {
  const currentState = chatStates[chatId].state;

  switch (currentState) {
    case states.WELCOME:
        
        break;
    case states.CITY:
      if (['Tel Aviv', 'Ramat Gat', 'Givaataim', 'Petah Tiqwa'].includes(messageText)) {
        chatStates[chatId].city = messageText;
        bot.sendMessage(chatId, translation.howMuchRoom);
        chatStates[chatId].state = states.ROOMS;
      } else {
        bot.sendMessage(chatId, "Please choose a city from the provided options.");
      }
      break;

    case states.PRICE:
      if (!isNaN(messageText)) {
        chatStates[chatId].price = messageText;
        bot.sendMessage(chatId, translation.howMuchPrice);
        chatStates[chatId].state = states.WELCOME;
      } else {
        bot.sendMessage(chatId, "Please enter a valid number for the maximum price.");
      }
      break;

    case states.ROOMS:
      if (["1", '2', "2.5", '3', '4', '5'].includes(messageText)) {
        chatStates[chatId].rooms = messageText;
       bot.sendMessage(chatId, translation.howMuchRoom);
       chatStates[chatId].state = states.PRICE;
      } else {
        bot.sendMessage(chatId, "Please choose the number of rooms from the provided options.");
      }
      break;
  }
};

// Object to store chat states
const chatStates = {};

// Start the bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  chatStates[chatId] = { state: states.WELCOME };
});
