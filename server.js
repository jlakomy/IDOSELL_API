require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const apiKeyAuth = require("./middleware/apiKeyAuth");

const ordersRoutes = require("./routes/orders");

const { syncOrders, syncPendingOrders } = require("./controllers/ordersController");

const app = express();

app.use(cors());
app.use(express.json());

app.use(apiKeyAuth);

app.use("/orders", ordersRoutes);

async function start() {
  try {
    console.log("Łączenie z MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Połączono z MongoDB!");

    console.log("Pobieranie danych...");
      await syncOrders();
    


    const interval = Number(process.env.PENDING_SYNC_INTERVAL || 5);

    if (!Number.isFinite(interval) || interval <= 0) {
      console.error("Niepoprawna wartość PENDING_SYNC_INTERVAL w .env");
    }

    console.log(`Aktualizacja danych co ${interval} minut`);

    cron.schedule(`*/${interval} * * * *`, async () => {
      console.log("Automatyczna aktualizacjia zamówień...");
      try {
        await syncPendingOrders();
 
      } catch (err) {
        console.error("CRON błąd:", err.message);
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Serwer nasłuchuje na porcie: ${PORT}`);
    });

  } catch (err) {
    console.error("Błąd przy starcie serwera", err);
    process.exit(1);
  }
}

start();
