const TelegramBot = require('node-telegram-bot-api')
const translation = require('./translation.js')
const DB = require('./db.js')
const { cloneDeep } = require('lodash')
const { format } = require('date-fns')

let chatStates = {}

const citiesKeys = {
  tlv: 'תל אביב',
  ptct: 'פתח תקווה',
  rmg: 'רמת גן',
  gvtm: 'גבעתיים',
  rzion: 'ראשון לציון',
}

const citiesOptions = [
  [{ text: citiesKeys.tlv, callback_data: 'tlv' }],
  [
    { text: citiesKeys.rmg, callback_data: 'rmg' },
    { text: citiesKeys.gvtm, callback_data: 'gvtm' },
  ],
  [
    { text: citiesKeys.rzion, callback_data: 'rzion' },
    { text: citiesKeys.ptct, callback_data: 'ptct' },
  ],
  [{ text: 'אישור', callback_data: 'confirm' }],
]

const roomsOptions = [
  [
    { text: '1', callback_data: '10rooms' },
    { text: '2', callback_data: '20rooms' },
    { text: '2.5', callback_data: '25rooms' },
  ],
  [
    { text: '3', callback_data: '30rooms' },
    { text: '3.5', callback_data: '35rooms' },
    { text: '4', callback_data: '40rooms' },
  ],
  [
    { text: '4.5', callback_data: '45rooms' },
    { text: '5', callback_data: '50rooms' },
    { text: '5+', callback_data: '50plus' },
  ],
  [{ text: 'אישור', callback_data: 'confirm' }],
]

const priceRentOptions = [
  [
    { text: '1000-2000', callback_data: '1000-2000' },
    { text: '2000-3000', callback_data: '2000-3000' },
    { text: '3000-4000', callback_data: '3000-4000' },
  ],
  [
    { text: '4000-5000', callback_data: '4000-5000' },
    { text: '5000-6000', callback_data: '5000-6000' },
    { text: '6000-7000', callback_data: '6000-7000' },
  ],
  [
    { text: '7000-8000', callback_data: '7000-8000' },
    { text: '8000-9000', callback_data: '8000-9000' },
    { text: '9000-10000', callback_data: '9000-10000' },
  ],
  [
    { text: '10000-11000', callback_data: '10000-11000' },
    { text: '11000-12000', callback_data: '11000-12000' },
    { text: '12000+', callback_data: '12000plus' },
  ],
  [{ text: 'אישור', callback_data: 'confirm' }],
]

const extraOptions = [
  [
    { text: 'מיזוג', callback_data: 'airConditioner' },
    { text: 'מעלית', callback_data: 'elevator' },
    { text: 'משופצת', callback_data: 'renovated' },
  ],
  [
    { text: 'גישה לנכים', callback_data: 'disabledAccess' },
    { text: 'ממ״ד', callback_data: 'MMD' },
    { text: 'מחסן', callback_data: 'storageRoom' },
  ],
  [
    { text: 'חיות מחמד', callback_data: 'animals' },
    { text: 'ריהוט', callback_data: 'equipment' },
    { text: 'כניסה מיידית', callback_data: 'immediateEntry' },
  ],
  [
    { text: 'חניה', callback_data: 'parking' },
    { text: 'מרפסת', callback_data: 'balcony' },
  ][{ text: 'אישור', callback_data: 'confirm' }],
]

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = process.env.TELEGTAM_TOKEN
console.log('botToken', botToken)
const bot = new TelegramBot(botToken, { polling: true })
// States for conversation
const states = {
  WELCOME: 'welcome',
  NAME: 'name',
  CITY_MULTISELECT: 'city_multiselect',
  ROOMS_MULTISELECT: 'rooms_multiselect',
  PRICE_MULTISELECT: 'price_multiselect',
  EXTRA_MULTISELECT: 'extra_multiselect',
  FEEDBACK: 'feedback',
  DONE: 'done',
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const user = await getUser(chatId)
  if (!user) return
  const messageText = msg.text
  const options = {
    reply_markup: {
      inline_keyboard: [[{ text: 'ברור!', callback_data: 'yes' }]],
    },
  }
  switch (messageText) {
    case '/start':
      bot.sendMessage(chatId, translation.welcome, options)
      moveToState(chatId, states.WELCOME, true)
      break
    case '/feedback':
      bot.sendMessage(chatId, translation.feedback)
      moveToState(chatId, states.FEEDBACK)
      break
    default:
      // Process user input based on the current state
      processUserInput(chatId, messageText)
      break
  }
})

function getUpdatedInlineKeyboard(user, options, type, selectedOption) {
  const cloneOptions = JSON.parse(JSON.stringify(options))
  for (const rowOptions of cloneOptions) {
    for (const option of rowOptions) {
      const userPreferences = user.preferences
      const isMarked = !!userPreferences?.[type]?.[option.callback_data]
      if (option.callback_data === selectedOption) {
        option.text = isMarked ? option.text : `✅ ${option.text}`
        userPreferences[type] = {
          ...(userPreferences[type] || {}),
          [selectedOption]: !isMarked,
        }
      } else {
        option.text = isMarked ? `✅ ${option.text}` : option.text
      }
    }
  }

  return { inline_keyboard: cloneOptions }
}

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id
  const user = await getUser(chatId)
  if (!user) return
  const selectedOption = query.data
  const userPreferences = user.preferences
  const currentState = userPreferences.state
  switch (currentState) {
    case states.WELCOME:
      if (selectedOption == 'yes') {
        bot.sendMessage(chatId, translation.whatIsYourName)
        moveToState(chatId, states.NAME)
      }
      break
    case states.CITY_MULTISELECT:
      if (selectedOption != 'confirm') {
        const updatedInlineKeyboard = getUpdatedInlineKeyboard(
          user,
          citiesOptions,
          'cities',
          selectedOption
        )
        bot.editMessageReplyMarkup(updatedInlineKeyboard, {
          chat_id: chatId,
          message_id: query.message.message_id,
        })
      } else {
        const options = {
          reply_markup: {
            inline_keyboard: roomsOptions,
          },
        }
        bot.sendMessage(chatId, translation.howMuchRoom, options)
        moveToState(chatId, states.ROOMS_MULTISELECT)
      }
      break
    case states.ROOMS_MULTISELECT:
      if (selectedOption != 'confirm') {
        const updatedInlineKeyboard = getUpdatedInlineKeyboard(
          user,
          roomsOptions,
          'rooms',
          selectedOption
        )
        bot.editMessageReplyMarkup(updatedInlineKeyboard, {
          chat_id: chatId,
          message_id: query.message.message_id,
        })
      } else {
        const options = {
          reply_markup: {
            inline_keyboard: priceRentOptions,
          },
        }
        bot.sendMessage(chatId, translation.howMuchPrice, options)
        moveToState(chatId, states.PRICE_MULTISELECT)
      }
      break
    case states.PRICE_MULTISELECT:
      if (selectedOption != 'confirm') {
        const updatedInlineKeyboard = getUpdatedInlineKeyboard(
          user,
          priceRentOptions,
          'prices',
          selectedOption
        )
        bot.editMessageReplyMarkup(updatedInlineKeyboard, {
          chat_id: chatId,
          message_id: query.message.message_id,
        })
      } else {
        const options = {
          reply_markup: {
            inline_keyboard: extraOptions,
          },
        }
        bot.sendMessage(chatId, translation.extraText, options)
        moveToState(chatId, states.EXTRA_MULTISELECT)
      }
      break
    case states.EXTRA_MULTISELECT:
      if (selectedOption != 'confirm') {
        const updatedInlineKeyboard = getUpdatedInlineKeyboard(
          user,
          extraOptions,
          'extra',
          selectedOption
        )
        bot.editMessageReplyMarkup(updatedInlineKeyboard, {
          chat_id: chatId,
          message_id: query.message.message_id,
        })
      } else {
        bot.sendMessage(chatId, translation.gettingStarted)
        moveToState(chatId, states.DONE)
      }
      break
    case states.FEEDBACK:
    case states.DONE:
      if (selectedOption.includes('listings_')) {
        const MAXIMUM_NOTIFY = 1
        const period = selectedOption.slice(selectedOption.indexOf('_') + 1)
        const matchListing = await DB.getMatchListing(chatId, period)
        if (!matchListing) return
        const listings = cloneDeep(matchListing.listings)
        let notifiedListings = 0
        for (const listing of listings) {
          if (notifiedListings >= MAXIMUM_NOTIFY) break
          if (listing.isNotified) continue
          listing.isNotified = true
          const listingObj = await DB.getListing(listing.listingId)
          await sendMessage(chatId, listingObj)
          notifiedListings++
        }
        const unNotifiedListingsLength = listings.filter(
          (obj) => !obj.isNotified
        ).length
        matchListing.listings = listings
        await matchListing.save()
        if (unNotifiedListingsLength != 0)
          sendMoreListings(chatId, unNotifiedListingsLength, period)
        else sendCustomMessage(chatId, 'לא נותרו דירות להצגה ליום זה')
      }
      break
  }
})

const moveToState = async (chatId, state, cleanPreferences) => {
  const user = await getUser(chatId)
  const userPreferences = cleanPreferences ? {} : user?.preferences || {}
  userPreferences.state = state
  const updatedUser = await DB.createOrUpdateUser({
    chatId,
    preferences: userPreferences,
  })
  chatStates[chatId] = updatedUser
}

// Function to process user input based on the current state
const processUserInput = async (chatId, messageText) => {
  const user = await getUser(chatId)
  const userPreferences = user.preferences
  const currentState = userPreferences.state
  const options = {
    parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: citiesOptions,
    },
  }
  switch (currentState) {
    case states.NAME:
      userPreferences.name = messageText
      bot.sendMessage(
        chatId,
        translation.whichCity(userPreferences.name),
        options
      )
      moveToState(chatId, states.CITY_MULTISELECT)
      break
    case states.FEEDBACK:
      await DB.addFeedback(chatId, messageText)
      bot.sendMessage(chatId, translation.thanksFeedback)
      moveToState(chatId, states.DONE)
      break
  }
}

const getUser = async (chatId) => {
  if (chatStates[chatId]) {
    return chatStates[chatId]
  } else {
    const user = await DB.getUser(chatId)
    chatStates[chatId] = user
    return user
  }
}

const sendArrayImages = async (chatId, imageUrls) => {
  const media = imageUrls.map((imageUrl) => ({
    type: 'photo',
    media: imageUrl,
  }))

  await bot.sendMediaGroup(chatId, media).catch((error) => {
    console.error('Error sending images:', error)
  })
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const extraApartmentDetails = (list) => {
  const airConditioner = list.airConditioner
  const elevator = list.elevator
  const renovated = list.renovated
  const disabledAccess = list.disabledAccess
  const MMD = list.MMD
  const isRoommates = list.isRoommates
  const storageRoom = list.storageRoom
  const animals = list.animals
  const equipment = list.equipment
  const balcony = list.balcony
  const parking = list.parking
  const immediateEntry = list.immediateEntry
  return `<b>מאפיינים נוספים:</b>\n${isRoommates ? `👥 מתאים לשותפים       ` : ''}${airConditioner ? `❄️ מיזוג       ` : ''}${elevator ? `🛗 מעלית       ` : ''}${renovated ? `🔨 משופצת       ` : ''}${disabledAccess ? `♿️ גישה לנכים       ` : ''}${MMD ? `🛐 ממ״ד       ` : ''}${storageRoom ? `📦 יש מחסן       ` : ''}${animals ? `🐶 מותר בעלי חיים       ` : ''}${equipment ? `🪑 ריהוט       ` : ''}${balcony ? `🎑 מרפסת       ` : ''}${parking ? `🅿️ חנייה       ` : ''}${immediateEntry ? `⏲️ כניסה מיידית       ` : ''}\n`
}

const sendMessage = async (chatId, list) => {
  const imageUrls = list.imagesUrls.filter(
    (url) => url.includes('scontent') || url.includes('yad2')
  )
  const price = list.price
  const city = list.city
  const squareSize = list.squareSize
  const rooms = list.rooms
  const location = list.location
  const proximity = list.proximity
  const floor = list.floor
  const isBroker = list.isBroker
  const contact = list.contact
  const entryDate = list.entryDate
  const postUrl = list.postUrl
  const createdAt = list.createdAt
  try {
    await sendArrayImages(chatId, imageUrls)
    await bot.sendMessage(
      chatId,
      `${format(createdAt, 'dd.MM.yyyy')}\n\n${isBroker ? '<b>🚨 מתיווך 🚨</b>\n' : ''}<b>מיקום:</b> ${citiesKeys[city]}${location ? `, ${location}\n` : ''}${price ? `<b>מחיר:</b> ${price} 🤑\n` : ''}${
        contact ? `<b>יצירת קשר:</b> ${contact} ☎️\n` : ''
      }\n${
        rooms ? `<b>מספר חדרים:</b> ${rooms}\n` : ''
      }${squareSize ? `<b>גודל:</b> ${squareSize} מטר רבוע\n` : ''}${
        floor ? `<b>קומה:</b> ${floor}\n` : ''
      }${proximity ? `<b>בקרבת:</b> ${proximity}\n` : ''}${
        entryDate ? `<b>תאריך כניסה:</b> ${entryDate}\n` : ''
      }\n${extraApartmentDetails(list)}\n\n${postUrl}`,
      { parse_mode: 'HTML' }
    )
    await delay(300)
  } catch (e) {
    console.log('error', price, squareSize, location, postUrl, e)
    return
  }
}

const sendTotalFoundMessage = async (userName, match) => {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'שלחי לי דירות', callback_data: `listings_${match.period}` }],
      ],
    },
  }
  await sendCustomMessage(
    match.chat_id,
    `היי ${userName}, היום מצאתי בשבילך <b>${match.listings.length} דירות</b> חדשות.\nלשלוח לך אותן?`,
    options
  )
}

const sendMoreListings = async (chatId, listingLength, period) => {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'שלחי לי עוד דירות', callback_data: `listings_${period}` }],
      ],
    },
  }
  await sendCustomMessage(
    chatId,
    `נותרו עוד <b>${listingLength} דירות</b> להצגה`,
    options
  )
}

const sendCustomMessage = async (chatId, customMessage, options) => {
  try {
    await bot.sendMessage(chatId, customMessage, {
      ...options,
      parse_mode: 'HTML',
    })
    await delay(300)
  } catch (e) {
    return
  }
}

module.exports.sendMessage = sendMessage
module.exports.sendCustomMessage = sendCustomMessage
module.exports.sendTotalFoundMessage = sendTotalFoundMessage
