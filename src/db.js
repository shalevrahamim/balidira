const Sequelize = require("sequelize");
const { DataTypes, Op } = Sequelize;
const { Promise } = require("bluebird");

console.log("script started");

const sequelize = new Sequelize({
  dialect: "postgres",
  username: "postgres",
  password: process.env.DB_PASSWORD,
  database: "postgres",
  host: process.env.DB_HOST,
  logging: true,
});

const User = sequelize.define("user", {
  chat_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  preferences: {
    type: DataTypes.JSONB,
  },
});

const Feedback = sequelize.define("feedback", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  chat_id: {
    type: DataTypes.STRING,
  },
  feedback: {
    type: DataTypes.STRING,
  },
});

const matchListing = sequelize.define("match_listings", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  period: { type: DataTypes.STRING },
  chat_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  listings: {
    type: DataTypes.JSONB,
  },
});

const Listing = sequelize.define(
  "listing",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING,
    },
    provider: {
      type: DataTypes.STRING,
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
      type: DataTypes.DOUBLE,
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
      type: DataTypes.TEXT,
    },
    originalContent: {
      type: DataTypes.TEXT,
    },
    originalContentHash: {
      type: DataTypes.STRING,
    },
    imagesUrls: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      defaultValue: [],
    },
    isNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "rent",
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true, // You can specify whether the index should be unique or not
        fields: ["originalContentHash"],
      },
    ],
  }
);

module.exports.createOrUpdateUser = async ({ chatId, preferences }) => {
  let user;
  try {
    user = await User.findOne({
      where: {
        // I think the casting should be handled in the client
        chat_id: String(chatId),
      },
    });
  } catch (error) {
    console.error("failed to find user", { chatId, error });
  }

  if (user) {
    // User exists, update preferences
    user.preferences = preferences;
    await user.save();
  } else {
    // User does not exist, create a new user
    const newUser = {
      chat_id: chatId,
      preferences: preferences,
    };

    user = await User.create(newUser);
    console.log("New user created:", user.toJSON());
  }
  return user.toJSON();
};

module.exports.addFeedback = async (chatId, feedback) => {
  const newFeedback = {
    chat_id: chatId,
    feedback,
  };
  await Feedback.create(newFeedback);
};

module.exports.getAllUsers = async () => {
  let allUsers;
  try {
    allUsers = await User.findAll();
    return allUsers.map((user) => user.toJSON());
  } catch (error) {
    console.error("Failed to find all users:", error);
  }
  return allUsers.map((user) => user.toJSON());
};

module.exports.createListings = async (listings) => {
  await Promise.each(listings, async (listing) => {
    try {
      await Listing.create(listing);
    } catch (error) {
      console.error("failed to create listing", error);
    }
  });
};

module.exports.createMatchListings = async (matches) => {
  await Promise.each(matches, async (match) => {
    try {
      await matchListing.create(match);
    } catch (error) {
      console.error("failed to create listing", error);
    }
  });
};

module.exports.getUnNotifiedListings = async () => {
  let listings;
  try {
    listings = await Listing.findAll({
      where: {
        isNotified: false,
      },
    });
  } catch (error) {
    console.log("failed to find unnotified listings", error);
  }

  return listings;
};

module.exports.isListingExist = async (postUrl) => {
  let listings;
  try {
    listings = await Listing.findOne({ where: { postUrl } });
  } catch (error) {
    console.log("failed to find unnotified listings", error);
  }

  return !!listings;
};

module.exports.getMatchingUsersForListing = async (listing) => {
  try {
    const floorPrice = Math.floor(listing.price / 1000) * 1000;
    const topPrice = floorPrice + 1000;
    const cityFiltered = `preferences.cities.${listing.city}`;
    const roomsFiltered =
      listing.rooms > 5
        ? "preferences.rooms.5plus"
        : `preferences.rooms.${listing.rooms * 10}rooms`;
    const priceFiltered =
      floorPrice >= 12000
        ? "preferences.prices.12000plus"
        : `preferences.prices.${floorPrice}-${topPrice}`;
    const whereClause = {
      [cityFiltered]: true,
      [roomsFiltered]: true,
      [priceFiltered]: true,
    };
    const matchingUsers = await User.findAll({ where: whereClause });
    return matchingUsers.map((user) => user.toJSON());
  } catch (error) {
    console.error("Error while fetching matching users:", error);
    throw error;
  }
};

module.exports.getMatchListing = async (chatId, period) => {
  try {
    const matchList = await matchListing.findOne({
      where: {
        chat_id: String(chatId),
        period,
      },
    });
    return matchList;
  } catch (error) {
    console.error("failed to find user with chatId", { chatId, error });
    return null;
  }
};

module.exports.getUser = async (chatId) => {
  let user;
  try {
    user = await User.findOne({
      where: {
        chat_id: String(chatId),
      },
    });
    if (!user) {
      const newUser = {
        chat_id: chatId,
        preferences: {},
      };

      user = await User.create(newUser);
      console.log("New user created:", user.toJSON());
    }
  } catch (error) {
    console.error("failed to find user with chatId", { chatId, error });
  }

  return user.toJSON();
};

module.exports.getListing = async (listingId) => {
  let listing;
  try {
    listing = await Listing.findOne({
      where: {
        id: listingId,
      },
    });
  } catch (error) {
    console.error("failed to find user with chatId", { chatId, error });
  }
  return listing.toJSON();
};

const creteriaClause = async (preferences) => {
  const minPrice = Math.min(preferences.price);
  const maxPrice = Math.min(preferences.price);
  return {
    listing: {
      price: {
        [Op.between]: [minPrice, maxPrice],
      },
    },
  };
};

const transformPreferences = (preferences) => {
  const price = preferences.price.map((price) => price.split("-")).flat();
  delete preferences.price;
  return {
    price,
    ...preferences,
  };
};

module.exports.isCriteriaMatchListing = async (chatId, listing) => {
  const user = await getUser(chatId);
  const preferences = transformPreferences(user.preferences);
  let isCriteriaMatch;
  try {
    isCriteriaMatch = Listing.findOne({
      where: creteriaClause(preferences),
    });
  } catch (error) {
    console.log("failed to find creteria with listing", { listing, error });
  }

  return isCriteriaMatch;
};
