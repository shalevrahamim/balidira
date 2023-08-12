const TelegramBot = require('node-telegram-bot-api');
const translation = require('./translation.js');
const DB = require('./db.js');

const citiesOptions = [
  [{ text: 'תל אביב', callback_data: 'tlv' }, { text: 'פתח תקווה', callback_data: 'ptct' }],
  [{ text: 'רמת גן', callback_data: 'rmg' }, { text: 'גבעתיים', callback_data: 'gvtm' }],
  [{ text: 'אישור', callback_data: 'confirm' }],
];

const roomsOptions = [
  [{ text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '2.5', callback_data: '2.5' }],
  [{ text: '3', callback_data: '3' }, { text: '3.5', callback_data: '3.5' }, { text: '4', callback_data: '4' }],
  [{ text: '4.5', callback_data: '4.5' }, { text: '5', callback_data: '5' }, { text: '5+', callback_data: '5plus' }],
  [{ text: 'אישור', callback_data: 'confirm' }],
];

const priceRentOptions = [
  [{ text: '1000-2000', callback_data: '1000-2000' }, { text: '2000-3000', callback_data: '2000-3000' }, { text: '3000-4000', callback_data: '3000-4000' }],
  [{ text: '4000-5000', callback_data: '4000-5000' }, { text: '5000-6000', callback_data: '5000-6000' }, { text: '6000-7500', callback_data: '6000-7500' }],
  [{ text: '7500-9000', callback_data: '7500-9000' }, { text: '9000-10000', callback_data: '9000-10000' }, { text: '10000+', callback_data: '10000plus' }],
  [{ text: 'אישור', callback_data: 'confirm' }],
];

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = process.env.TELEGTAM_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });
// States for conversation
const states = {
    WELCOME: 0,
    NAME: 1,
    CITY: 2,
    CITY_MULTISELECT: 3,
    ROOMS: 4,
    ROOMS_MULTISELECT: 5,
    PRICE: 6,
    PRICE_MULTISELECT: 7,
    DONE: 8,
};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  switch (messageText) {
    case '/start':
        const options = {
          reply_markup: {
            inline_keyboard: [[{ text: 'ברור!', callback_data: 'yes' }]]
          },
        };
        bot.sendMessage(chatId, translation.welcome, options);
        moveToState(chatId, states.WELCOME, true);
        break;
    default:
      // Process user input based on the current state
      processUserInput(chatId, messageText);
      break;
  }
});

async function getUpdatedInlineKeyboard(options, type, selectedOption, chatId) {
  const cloneOptions = JSON.parse(JSON.stringify(options));  
  cloneOptions.forEach((rowOptions) => {
      rowOptions.forEach(async (option) => {
        const userPreferences = await getUser(chatId);
        const isMarked = !!userPreferences?.[type]?.[option.callback_data];
        if (option.callback_data === selectedOption) {
          option.text = isMarked ? option.text :`✅ ${option.text}`;
          userPreferences[type] = {
            ...(userPreferences[type] || {}),
            [selectedOption]: !isMarked
          }
        }
        else{
          option.text = isMarked ? `✅ ${option.text}`: option.text;
        }
      });
    });
  
    return {inline_keyboard: cloneOptions};
  }
  

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const selectedOption = query.data;
    const userPreferences = chatStates[chatId].preferences;
    const currentState = userPreferences.state;
    switch(currentState){
      case states.WELCOME:
        if(selectedOption == "yes") {
          bot.sendMessage(chatId, translation.whatIsYourName);
          moveToState(chatId, states.NAME);
        }
        break;
      case states.CITY_MULTISELECT:
        if(selectedOption != "confirm"){
          const updatedInlineKeyboard = getUpdatedInlineKeyboard(citiesOptions, 'cities', selectedOption, chatId);
          bot.editMessageReplyMarkup(updatedInlineKeyboard, {
              chat_id: chatId,
              message_id: query.message.message_id,
          });
        }
        else{
          const options = {
            reply_markup: {
              inline_keyboard: roomsOptions
            },
          };
          bot.sendMessage(chatId, translation.howMuchRoom, options);
          moveToState(chatId, states.ROOMS_MULTISELECT);
        }
        break;
        case states.ROOMS_MULTISELECT:
          if(selectedOption != "confirm"){
            const updatedInlineKeyboard = getUpdatedInlineKeyboard(roomsOptions, 'rooms', selectedOption, chatId);
            bot.editMessageReplyMarkup(updatedInlineKeyboard, {
                chat_id: chatId,
                message_id: query.message.message_id,
            });
          }
          else {
            const options = {
              reply_markup: {
                inline_keyboard: priceRentOptions
              },
            };
            bot.sendMessage(chatId, translation.howMuchPrice, options);
            moveToState(chatId, states.PRICE_MULTISELECT);
          }
          break;
        case states.PRICE_MULTISELECT:
          if(selectedOption != "confirm"){
            const updatedInlineKeyboard = getUpdatedInlineKeyboard(priceRentOptions, 'prices', selectedOption, chatId);
            bot.editMessageReplyMarkup(updatedInlineKeyboard, {
                chat_id: chatId,
                message_id: query.message.message_id,
            });
          }
          else{
            bot.sendMessage(chatId, translation.gettingStarted);
            moveToState(chatId, states.DONE);
          }
          break;
    }

});

const moveToState = async (chatId, state, cleanPreferences) => {
  const userPreferences = cleanPreferences ? {} : chatStates[chatId]?.preferences || {};
  userPreferences.state = state;
  const user = await DB.createOrUpdateUser({chatId, preferences: userPreferences})
  chatStates[chatId] = user;
  console.log(chatStates);

}

// Function to process user input based on the current state
const processUserInput = (chatId, messageText) => {
  const userPreferences = chatStates[chatId].preferences;
  const currentState = userPreferences.state;
  switch (currentState) {
    case states.NAME:
      const options = {
        parse_mode: 'markdown',
        reply_markup: {
          inline_keyboard: citiesOptions
        },
      };
      userPreferences.name = messageText;
      bot.sendMessage(chatId, translation.whichCity(userPreferences.name), options);
      moveToState(chatId, states.CITY_MULTISELECT);  
  }
};

let chatStates = {};

const getUser = async (chatId) => {
  if(chatsStates[chatId]){
    return chatStates[chatId];
  }
  else{
    const user = await DB.getUser(chatId);
    chatStates[chatId] = user;
    return user;
  }
}

DB.getUser(chat_id).then((user) => {
  console.log(user);
});

// Start the bot
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   moveToState(chatId, states.WELCOME)
// });
