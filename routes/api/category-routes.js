const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async  (req, res) => {
  try {
    const categories = await Category.findAll({
        include: [{ model: Product }],
    });
    res.json(categories);
} catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error });
}
});

router.get('/:id',async  (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
        include: [{ model: Product }],
    });

    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
} catch (error) {
    res.status(500).json({ message: 'Error retrieving category', error });
}
});

router.post('/', async  (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory);
} catch (error) {
    res.status(400).json({ message: 'Error creating category', error });
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
    res.json(updatedCategory);
} catch (error) {
    res.status(400).json({ message: 'Error updating category', error });
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

    res.status(204).end();
} catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
}
});

module.exports = router;
