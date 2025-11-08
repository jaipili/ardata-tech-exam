const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEthereumAddress(value) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
  },
  balance: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0',
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  transactionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'accounts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['address'],
    },
  ],
});

module.exports = Account;
