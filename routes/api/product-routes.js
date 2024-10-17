const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // Find all products, including associated Category and Tag data
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag } // Include tags through the ProductTag model
      ]
    });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // Find a single product by its `id`, including associated Category and Tag data
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
 try {
    // Validate request body
    const { product_name, price, stock, tagIds } = req.body;
    if (!product_name || !price || !stock) {
      return res.status(400).json({ message: 'Missing required fields: product_name, price, or stock.' });
    }
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4] 
    }
  */
  //Product.create(req.body)
  //.then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      const product = await Product.create({
        product_name,
        price,
        stock,
      });
      if (req.body.tagIds.length) {
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
      console.error(err);
      res.status(400).json(err);
    }
  });
    //.then((productTagIds) => res.status(200).json(productTagIds))
    //.catch((err) => {
//       console.log(err);
//       res.status(400).json(err);
//     });
// });

// update product
router.put('/:id', async (req, res) => {
  // update product data
  try {
    const [updated] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // .then((product) => {
    if (req.body.tagIds && req.body.tagIds.length) {

      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });
      //.then((productTags) => {
        // create filtered list of new tag_ids
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => ({
            // return {
              product_id: req.params.id,
              tag_id,
            // }
          }));

        // figure out which ones to remove
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
        // run both actions
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      
    }
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});
//     return res.json(product);
//   })
//   .catch((err) => {
//     // console.log(err);
//     res.status(400).json(err);
//   });
// });

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
