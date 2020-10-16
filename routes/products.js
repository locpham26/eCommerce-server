const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const _ = require("lodash");
const { Product, validateProduct } = require("../models/product");
const { Category } = require("../models/category");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
});

router.get("/", async (req, res) => {
  const products = await Product.find();
  const new_products = products.map((product) => {
    return _.pick(product, ["_id", "name", "category", "price", "imageUrl"]);
  });
  res.send(new_products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).send("The product with the given id was not found");
  res.send(product);
});

router.get("/:id/image", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).send("The product with the given id was not found");
  res.set("Content-Type", "image/jpg");
  res.send(product.productImage);
});

router.post("/", upload.single("productImage"), async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category");

  let product = await Product.findOne({ name: req.body.name });
  if (product) return res.status(400).send("Product already exists");

  const id = new mongoose.Types.ObjectId();
  product = new Product({
    _id: id,
    name: req.body.name,
    category: {
      _id: category._id,
      name: category.name,
    },
    price: req.body.price,
    inventory: req.body.inventory,
    productImage: req.file.buffer,
    imageUrl: `http://localhost:3001/api/products/${id}/image`,
  });
  await product.save();

  res.send(product.name);
});

router.put("/:id", async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let isExisted = await Product.findOne({ name: req.body.name });
  if (isExisted) return res.status(400).send("product already exists");

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      category: {
        _id: category._id,
        name: category.name,
      },
      price: req.body.price,
      inventory: req.body.price,
    },
    {
      new: true,
    }
  );

  if (!product)
    return res.status(404).send("The product with the given ID was not found.");

  res.send(product);
});

router.patch("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  const quantity = req.body.quantity;
  if (product) {
    product.inventory -= quantity;
    product.soldQuantity += quantity;
    product.revenue += product.price * quantity;
  }
  await product.save();
  res.send(product);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const product = await Product.findByIdAndRemove(req.params.id);
  if (!product)
    return res.status(404).send("The product with the given id was not found");
  res.send(product);
});

module.exports = router;
