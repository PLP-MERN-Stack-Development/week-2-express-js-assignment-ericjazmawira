// server.js 

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Parse JSON
app.use(bodyParser.json());

// Middleware: Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware: Simple Authentication
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Example: token must be "Bearer mysecrettoken"
  if (authHeader === "Bearer mysecrettoken") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
  }
};

// Sample in-memory products database
let products = [
  {
    id: "1",
    name: "Laptop",
    description: "High-performance laptop with 16GB RAM",
    price: 1200,
    category: "electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Smartphone",
    description: "Latest model with 128GB storage",
    price: 800,
    category: "electronics",
    inStock: true,
  },
  {
    id: "3",
    name: "Coffee Maker",
    description: "Programmable coffee maker with timer",
    price: 50,
    category: "kitchen",
    inStock: false,
  },
];

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// GET all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// GET a specific product by ID
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

// POST - Create a new product (requires auth)
app.post("/api/products", authenticate, (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT - Update a product (requires auth)
app.put("/api/products/:id", authenticate, (req, res) => {
  const productId = req.params.id;
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { name, description, price, category, inStock } = req.body;

  products[productIndex] = {
    ...products[productIndex],
    name: name ?? products[productIndex].name,
    description: description ?? products[productIndex].description,
    price: price ?? products[productIndex].price,
    category: category ?? products[productIndex].category,
    inStock: inStock ?? products[productIndex].inStock,
  };

  res.status(200).json(products[productIndex]);
});

// DELETE - Delete a product (requires auth)
app.delete("/api/products/:id", authenticate, (req, res) => {
  const productId = req.params.id;
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const deletedProduct = products.splice(productIndex, 1);
  res.status(200).json({ message: "Product deleted", product: deletedProduct[0] });
});

// 404 Middleware for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing
module.exports = app;
