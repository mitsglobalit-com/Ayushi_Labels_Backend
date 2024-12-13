const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Increase the payload size limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Utility functions for reading and writing data to JSON files
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    const parsedData = JSON.parse(data);
    // If the data is an array, convert it to object structure
    if (Array.isArray(parsedData)) {
      return { [filePath.replace(".json", "")]: parsedData };
    }
    return parsedData;
  } catch (error) {
    console.error("Error reading file:", filePath, error);
    // Return default structure with empty array
    const defaultKey = filePath.replace(".json", "");
    return { [defaultKey]: [] };
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing file:", filePath, error);
  }
};

// Routes for Assets Master Start
app.get("/assets_master", (req, res) => {
  try {
    const data = readData("assets_master.json");
    res.json(data);
  } catch (error) {
    console.error("Error in GET /assets_master:", error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

app.post("/assets_master", (req, res) => {
  try {
    const data = readData("assets_master.json");
    const newAsset = {
      ...req.body,
      id: Date.now(), // Use timestamp as ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!data.assets_master) {
      data.assets_master = [];
    }

    data.assets_master.push(newAsset);
    writeData("assets_master.json", data);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error in POST /assets_master:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

app.put("/assets_master/:id", (req, res) => {
  try {
    const data = readData("assets_master.json");
    const { id } = req.params;
    const updatedAsset = req.body;

    if (!data.assets_master) {
      return res.status(404).json({ error: "No assets found" });
    }

    const assetIndex = data.assets_master.findIndex(
      (asset) => asset.id === parseInt(id)
    );

    if (assetIndex === -1) {
      return res.status(404).json({ error: "Asset not found" });
    }

    // Preserve important fields
    const existingAsset = data.assets_master[assetIndex];
    data.assets_master[assetIndex] = {
      ...updatedAsset,
      id: existingAsset.id, // Keep the same ID
      created_at: existingAsset.created_at,
      updated_at: new Date().toISOString(),
    };

    writeData("assets_master.json", data);
    res.json(data.assets_master[assetIndex]);
  } catch (error) {
    console.error("Error in PUT /assets_master/:id:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

app.delete("/assets_master/:id", (req, res) => {
  try {
    const data = readData("assets_master.json");
    const { id } = req.params;

    if (!data.assets_master) {
      return res.status(404).json({ error: "No assets found" });
    }

    const initialLength = data.assets_master.length;
    data.assets_master = data.assets_master.filter(
      (asset) => asset.id !== parseInt(id) // Match by 'id' instead of 'uid'
    );

    if (data.assets_master.length === initialLength) {
      return res.status(404).json({ error: "Asset not found" });
    }

    writeData("assets_master.json", data);
    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /assets_master/:id:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});
// Routes for Assets Master End

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
