const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
  const product = Product.create(req.body)
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        await ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  });

// update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const [updated] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If tagIds are provided, handle updating the ProductTag relationships
    if (req.body.tagIds && req.body.tagIds.length) {
      // Find existing product tags
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      // Get existing tag IDs for this product
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      // Determine which tags need to be removed
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // Remove old tags and add new ones
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }), 
        ProductTag.bulkCreate(newProductTags),  
      ]);
    }

    // Fetch the updated product with its associations (Category and Tags)
    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });

    // Respond with the updated product
    return res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err); 
  }
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
});

module.exports = router;
