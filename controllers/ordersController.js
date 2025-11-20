const { fetchAllOrders, mapOrder, fetchOrdersBySerialNumbers } = require("../services/idoSell");
const Order = require("../models/Order");
const stringify = require("csv-stringify").stringify;


async function syncOrders(req, res) {
    try {
        const raw = await fetchAllOrders();

        const items = raw.items || [];

        const normalized = items.map(mapOrder);


        for (const order of normalized) {

            const existing = await Order.findOne({ orderId: order.orderId });
            if (existing && existing.changeDate > order.changeDate) {
                continue;
            }

            await Order.findOneAndUpdate(
                { orderId: order.orderId },
                order,
                { upsert: true }
            );
        }

        if (!res) {
            return {
                message: "Pobieranie danych zakończone sukcesem!",
                imported: normalized.length
            };
        }
        res.json({
            message: "Pobieranie danych zakończone sukcesem!",
            imported: normalized.length
        });

    } catch (err) {
        console.error("Błąd przy pobieraniu danych:", err);
        res.status(500).json({ error: "Błąd przy pobieraniu danych!" });
    }
}


async function syncPendingOrders(req, res) {
    try {
        console.log("Aktualizacja danych...");

        const pendingOrders = await Order.find(
            {
                status: { $nin: ["finished", "lost", "false"] }
            },
            { orderId: 1, _id: 0 }
        );

        if (pendingOrders.length === 0) {
            console.log("Brak zamówień do aktualizacji.");
        }

        const serialNumbers = pendingOrders.map(o => o.orderId);

        const updatedRaw = await fetchOrdersBySerialNumbers(serialNumbers);

        const normalized = updatedRaw.map(mapOrder);

        for (const order of normalized) {
            const existing = await Order.findOne({ orderId: order.orderId });
            if (existing && existing.changeDate > order.changeDate) continue;

            await Order.findOneAndUpdate(
                { orderId: order.orderId },
                order,
                { upsert: true }
            );
        }

        console.log(`Zaktualizowano zamówienia`);

        return normalized.length;

    } catch (err) {
        console.error("Błąd przy aktualizacji danych:", err);
    }
}

async function getOrderById(req, res) {
    try {
        const id = req.params.id;

        const order = await Order.findOne({ orderId: id });

        if (!order) {
            return res.status(404).json({ error: "Nie znaleziono zamowienia" });
        }

        res.json(order);

    } catch (err) {
        console.error("GET ORDER ERROR:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getOrdersCSV(req, res) {
    try {
        let { minWorth, maxWorth } = req.query;

        const filter = {};

        if (minWorth !== undefined) {
            filter.worth = { ...filter.worth, $gte: Number(minWorth) };
        }

        if (maxWorth !== undefined) {
            filter.worth = { ...filter.worth, $lte: Number(maxWorth) };
        }

        const orders = await Order.find(filter).lean();

        const csvData = orders.map(order => ({
            orderId: order.orderId,
            worth: order.worth,
            status: order.status,
            products: order.products.map(p => `${p.productId}:${p.quantity}`).join(";")
        }));

        stringify(
            csvData,
            { header: true, columns: ["orderId", "worth", "status", "products"] },
            (err, output) => {
                if (err) {
                    console.error("CSV ERROR:", err);
                    return res.status(500).send("CSV generation error");
                }

                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
                res.send(output);
            }
        );

    } catch (err) {
        console.error("CSV GENERATION ERROR:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = { syncOrders, syncPendingOrders, getOrderById, getOrdersCSV };
