const Sequelize = require('sequelize');
require('dotenv').config()

const { DataTypes, Op } = Sequelize;

const { Promise } = require('bluebird');

console.log('script started');

const sequelize = new Sequelize({
  dialect: 'postgres',
  username: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  host: process.env.DB_HOST,
  logging: true,
});


const User = sequelize.define('user', {
  chat_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  preferences: {
    type: DataTypes.JSONB
  },
  createdAt: 'createdat',
  updatedAt: 'updatedat'
});

const Listing = sequelize.define('listing', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  squareSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  proximity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isBroker: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entryDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  moreDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  postUrl: {
    type: DataTypes.TEXT
  },
  originalContent: {
    type: DataTypes.TEXT,
  },
  imagesUrls: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    defaultValue: [],
  },
  isNotified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Listing.sync();


module.exports.createOrUpdateUser = async ({ chatId, preferences }) => {
  let user;
  try {
    user = await User.findOne({
      where: {
        // I think the casting should be handled in the client 
        chat_id: String(chatId)
      }
    });
  } catch (error) {
    console.error('failed to find user', { chatId, error})
  }

  if (user) {
    // User exists, update preferences
    user.preferences = preferences;
    await user.save();
    console.log('user updated')
  } else {
    // User does not exist, create a new user
    const newUser = {
      chat_id: chatId,
      preferences: preferences
    };

    user = await User.create(newUser);
    console.log('New user created:', user.toJSON());
  }
  return user.toJSON();
};

module.exports.getAllUsers = async () => {
  let allUsers;
  try {
    allUsers = await User.findAll();
    return allUsers.map(user => user.toJSON());
  } catch (error) {
    console.error('Failed to find all users:', error);
  }
  return allUsers.map(user => user.toJSON());
};

module.exports.createListings = async (listings) => {
  await Promise.each(listings, async (listing) => {
    try {
      await Listing.create(listing);
    } catch (error) {
      console.error('failed to create listing', error);
    }
  })
}

module.exports.getUnNotifiedListings = async() => {
  let listings;
  try {
    listings = await Listing.findAll({
      where: {
        isNotified: false,
      },
    });
  } catch (error) {
    console.log('failed to find unnotified listings', error)
  }

  return listings;
}

module.exports.getUser = async (chatId) => {
  let user;
  try {
    user = await User.findOne({ 
      where: {
        chat_id: String(chatId),
      },
    });
  } catch (error) {
    console.error('failed to find user with chatId', { chatId, error});
  }

  return user;
};

const creteriaClause = async (preferences) => {
  const minPrice = Math.min(preferences.price)
  const maxPrice = Math.min(preferences.price)
  return {
    listing: {
      price: {
        [Op.between]: [minPrice, maxPrice]
      },
    },
  };
};

const transformPreferences = (preferences) => {
  const price = preferences.price.map((price) => price.split("-")).flat()
  delete preferences.price
  return {
    price,
    ...preferences
  }
}

module.exports.isCriteriaMatchListing = async (chatId, listing) => {
  const user = await getUser(chatId);
  const preferences = transformPreferences(user.preferences)
  let isCriteriaMatch;
  try {
    isCriteriaMatch = Listing.findOne({
      where: creteriaClause(preferences),
    });
  } catch (error) {
    console.log('failed to find creteria with listing', { listing, error });
  }

  return isCriteriaMatch;
};

console.log('synccc')
