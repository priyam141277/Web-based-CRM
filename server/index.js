require("dotenv").config();

const express = require("express");
const path = require("path");

const {
  addLead,
  getLeads,
  updateCell
} = require("./googleSheets");

const app = express();

app.use(express.json());

// Serve your frontend
app.use(express.static(path.join(__dirname, "../client/crm")));

// Submit lead
app.post("/submit", async (req, res) => {
  try {
    await addLead(req.body);

    res.json({
      message: "Lead saved successfully"
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);

    res.status(500).json({
      error: "Error saving lead"
    });
  }
});

// Get leads
app.get("/leads", async (req, res) => {
  try {
    const role = req.query.role;
    const user = req.query.user;

    const data = await getLeads();

    if (role === "owner") {
      return res.json(data);
    }

    const filtered = data.filter((row, index) => {
      if (index === 0) return true;

      return row[7] === user;
    });

    res.json(filtered);

  } catch (err) {
    console.error("LEADS ERROR:", err);

    res.status(500).json({
      error: "Error fetching leads"
    });
  }
});

// Assign lead
app.post("/assign-lead", async (req, res) => {
  try {
    const { rowIndex, assignedTo } = req.body;

    if (!rowIndex || !assignedTo) {
      return res.status(400).json({
        error: "Missing rowIndex or assignedTo"
      });
    }

    await updateCell(rowIndex, "H", assignedTo);

    res.json({
      message: "Assigned successfully"
    });

  } catch (err) {
    console.error("ASSIGN ERROR:", err);

    res.status(500).json({
      error: "Assignment failed"
    });
  }
});

// Update status
app.post("/update-status", async (req, res) => {
  try {
    const { rowIndex, status } = req.body;

    if (!rowIndex || !status) {
      return res.status(400).json({
        error: "Missing rowIndex or status"
      });
    }

    await updateCell(rowIndex, "G", status);

    console.log(
      "Status updated:",
      status,
      "at row",
      rowIndex
    );

    res.json({
      message: "Status updated"
    });

  } catch (err) {
    console.error("STATUS ERROR:", err);

    res.status(500).json({
      error: "Update failed"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CRM server running on port ${PORT}`);
});