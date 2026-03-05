const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.postgres');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product name is required' },
        len: { args: [1, 255], msg: 'Product name must be between 1 and 255 characters' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Price must be a valid decimal number' },
        min: { args: [0], msg: 'Price must be a positive number' },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Stock must be an integer' },
        min: { args: [0], msg: 'Stock cannot be negative' },
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: { msg: 'Image URL must be a valid URL' },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['isActive'] },
      { fields: ['price'] },
      { fields: ['name'] },
    ],
  }
);

module.exports = Product;
