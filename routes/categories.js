const express = require("express");
const router = express.Router();
const { Category, validateCategory } = require("../models/category");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(404).send("The category with the given id was not found");
  res.send(category);
});

router.post("/", async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let category = await Category.findOne({ name: req.body.name });
  if (category) return res.status(400).send("Category already exists");

  category = new Category({ name: req.body.name });
  await category.save();

  res.send(category);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let isExisted = await Category.findOne({ name: req.body.name });

  if (isExisted) return res.status(400).send("Category already exists");

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    {
      new: true,
    }
  );

  if (!category)
    return res
      .status(404)
      .send("The category with the given ID was not found.");

  res.send(category);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);
  if (!category)
    return res.status(404).send("The category with the given id was not found");
  res.send(category);
});

module.exports = router;
