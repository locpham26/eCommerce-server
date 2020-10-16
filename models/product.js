const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { categorySchema } = require("./category");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  category: {
    type: categorySchema,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  inventory: {
    type: Number,
    required: true,
    min: 0,
    max: 999999,
  },
  productImage: {
    type: Buffer,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  soldQuantity: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
});

const Product = mongoose.model("Product", productSchema);

function validateProduct(product) {
  const schema = {
    name: Joi.string().min(3).max(30).required(),
    categoryId: Joi.objectId().required(),
    price: Joi.number().min(0).max(100).required(),
    inventory: Joi.number().min(0).max(999999).required(),
  };

  return Joi.validate(product, schema);
}

exports.productSchema = productSchema;
exports.Product = Product;
exports.validateProduct = validateProduct;
