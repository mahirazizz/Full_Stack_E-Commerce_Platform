import { Product } from "../../models/product.models.js";

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    const trimmed = keyword.trim().slice(0, 50);
    if (!trimmed) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const safeRegex = new RegExp(escapeRegex(trimmed), "i");

    const createSearchQuery = {
      $or: [
        { title: safeRegex },
        { description: safeRegex },
        { category: safeRegex },
        { brand: safeRegex },
      ],
    };

    const searchResults = await Product.find(createSearchQuery).limit(50);

    res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while searching products",
    });
  }
};

export { searchProducts };
