const router = require('express').Router();
const { Category, Product } = require('../../models');
const { findAll } = require('../../models/Product');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create({
      category_name: req.body.category_name,
    });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const updatedCategory = await Category.findByPk(req.params.id);
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
