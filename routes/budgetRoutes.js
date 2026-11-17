
const express = require("express");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
    try {
        const budget = await Budget.findOne({
            user: req.session.userId
        });

        const now = new Date();

        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        const expenses = await Transaction.find({
            user: req.session.userId,
            type: "expense",
            date: { $gte: start, $lt: end }
        });

        const spent = expenses.reduce(
            (total, item) => total + item.amount,
            0
        );

        res.json({
            limit: budget ? budget.monthlyLimit : 0,
            spent
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not load budget"
        });
    }
});

router.put("/", async (req, res) => {
    try {
        const limit = Number(req.body.monthlyLimit);

        if (!Number.isFinite(limit) || limit <= 0) {
            return res.status(400).json({
                message: "Enter a valid budget"
            });
        }

        const budget = await Budget.findOneAndUpdate(
            { user: req.session.userId },
            { monthlyLimit: limit },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        res.json({
            message: "Budget saved",
            limit: budget.monthlyLimit
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not save budget"
        });
    }
});

module.exports = router;
