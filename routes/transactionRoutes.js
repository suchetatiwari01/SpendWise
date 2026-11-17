
const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// Get all transactions
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.session.userId
        }).sort({ date: -1, createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({
            message: "Could not load transactions"
        });
    }
});

// Add transaction
router.post("/", async (req, res) => {
    try {
        const { title, amount, type, category, date } = req.body;

        const value = Number(amount);

let selectedDate = new Date();

if (date !== undefined) {
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return res.status(400).json({
            message: "Enter a valid transaction date"
        });
    }

    selectedDate = new Date(`${date}T12:00:00.000Z`);

    if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate.toISOString().slice(0, 10) !== date
    ) {
        return res.status(400).json({
            message: "Enter a valid transaction date"
        });
    }
}

        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.length > 100 ||
            !Number.isFinite(value) ||
            value <= 0 ||
            !["income", "expense"].includes(type) ||
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                message: "Enter valid transaction details"
            });
        }

        
const transaction = await Transaction.create({
    user: req.session.userId,
    title: title.trim(),
    amount: value,
    type,
    category: category.trim(),
    date: selectedDate
});


        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({
            message: "Could not save transaction"
        });
    }
});

 // Update an existing transaction
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }

        const { title, amount, type, category, date } = req.body;
        const value = Number(amount);

        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.length > 100 ||
            !Number.isFinite(value) ||
            value <= 0 ||
            !["income", "expense"].includes(type) ||
            typeof category !== "string" ||
            !category.trim() ||
            typeof date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            return res.status(400).json({
                message: "Enter valid transaction details"
            });
        }

        const selectedDate = new Date(`${date}T12:00:00.000Z`);

        if (
            Number.isNaN(selectedDate.getTime()) ||
            selectedDate.toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                message: "Enter a valid transaction date"
            });
        }

        const updated = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.session.userId
            },
            {
                title: title.trim(),
                amount: value,
                type,
                category: category.trim(),
                date: selectedDate
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json(updated);

    } catch (error) {
        res.status(500).json({
            message: "Could not update transaction"
        });
    }
});

// Delete transaction
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }

        const deleted = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.session.userId
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not delete transaction"
        });
    }
});

module.exports = router;
