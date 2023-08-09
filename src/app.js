const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;


console.log('script started');

const sequelize = new Sequelize({
  dialect: 'postgres',
  username: 'postgres',
  password: 'q-8-)r{vp9xNN;h+',
  database: 'postgres',
  host: '34.31.109.100',
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

module.exports.createOrUpdateUser = async ({ chatId, preferences }) => {
  try {
    let user = await User.findOne({
      where: {
        chat_id: String(chatId)
      }
    });

    if (user) {
      // User exists, update preferences
      user.preferences = preferences;
      await user.save();
    } else {
      // User does not exist, create a new user
      const newUser = {
        chat_id: chatId,
        preferences: preferences
      };

      user = await User.create(newUser);
      console.log('New user created:', user.toJSON());
    }
    console.log('user updated')
    return user.toJSON();
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
};

module.exports.getAllUsers = async () => {
  try {
    const allUsers = await User.findAll();
    return allUsers.map(user => user.toJSON());
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};