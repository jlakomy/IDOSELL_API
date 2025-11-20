const axios = require("axios");

const BASE = process.env.IDOSELL_BASE_URL;
const ENDPOINT = process.env.IDOSELL_ORDERS_ENDPOINT;
const API_KEY = process.env.IDOSELL_API_KEY;

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function fetchOrdersPage(page) {
  const url = BASE + ENDPOINT;

  const headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
  };

  const body = {
    params: {
      shippmentStatus: "all",
      resultPage: page
    }
  };

  const res = await axios.post(url, body, { headers });
  return res.data;
}

async function fetchAllOrders() {
  let page = 0;
  let all = [];

  while (true) {
    const pageData = await fetchOrdersPage(page);

    const items = pageData.Results || [];

    all.push(...items);

    console.log(`📄 Strona ${page} / ${pageData.resultsNumberPage - 1}`);

    if (page >= pageData.resultsNumberPage - 1) {
      console.log("Pobrano dane!");
      break;
    }

    page++;
  }

  return { items: all };
}

function mapOrder(raw) {
  return {
    orderId: raw.orderSerialNumber,
    worth: raw.orderDetails?.payments?.orderCurrency?.orderProductsCost || 0,
    status: raw.orderDetails?.orderStatus || "unknown",
    updatedAt: new Date(),
    changeDate: new Date(raw.orderDetails?.orderChangeDate),
    products: raw.orderDetails?.productsResults?.map(p => ({
      productId: p.productId,
      quantity: p.productQuantity
    })) || []
  };
}

async function fetchOrdersBySerialNumbers(serials = []) {
  if (!Array.isArray(serials) || serials.length === 0) return [];

  const serialNums = serials
    .map(s => (typeof s === "string" ? parseInt(s, 10) : s))
    .filter(n => Number.isFinite(n));

  const batches = chunkArray(serialNums, parseInt(process.env.IDOSELL_BATCH_SIZE || "50", 10));

  const url = BASE + ENDPOINT;

  const headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  const results = [];

  for (const batch of batches) {
    try {
      const body = {
        params: {
          ordersSerialNumbers: batch
        }
      };

      const res = await axios.post(url, body, { headers, timeout: 60000 });

      const items = res.data?.Results || [];

      results.push(...items);

    } catch (err) {
      console.error("Błąd w fetchOrdersBySerialNumbers :", err.message);
    }
  }

  return results;
}

module.exports = { fetchAllOrders, mapOrder, fetchOrdersBySerialNumbers };
