import { Product } from "../../models/product.models.js";

const getFilterProducts = async (req, res) => {
  try {
    const {
      category = [],
      brand = [],
      sortBy = "price-lowtohigh",
      page,
      limit,
    } = req.query;

    const filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }
    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    const totalProducts = await Product.countDocuments(filters);

    let query = Product.find(filters).sort(sort);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum > 0 && limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const products = await query;

    res.status(200).json({
      success: true,
      data: products,
      pagination:
        pageNum > 0 && limitNum > 0
          ? {
              totalProducts,
              currentPage: pageNum,
              totalPages: Math.ceil(totalProducts / limitNum),
              limit: limitNum,
            }
          : null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred in fetching products",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred in getting product details",
    });
  }
};

export { getFilterProducts, getProductDetails };
