const express = require('express');
const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
const port = 3015;

// In-memory storage for alerts
let alerts = [];

// Function to trigger an alert
function alert() {
  const now = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  const alertMessage = `Alert! Current time in IST: ${now}`;
  alerts.push(alertMessage);
  console.log(alertMessage); // Keep console log for server-side visibility
}

// 2 PM IST
cron.schedule('0 14 * * *', () => {
  alert();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// 3 PM IST
cron.schedule('0 15 * * *', () => {
  alert();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Status endpoint
app.get('/status', (req, res) => {
  const now = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  res.json({
    status: 'running',
    currentTime: now
  });
});

// Endpoint to view alerts
app.get('/alerts', (req, res) => {
  res.json(alerts);
});

// Endpoint to clear alerts
app.post('/clear-alerts', (req, res) => {
  alerts = [];
  res.json({ message: 'Alerts cleared' });
});

// Serve a simple HTML page to display alerts
app.get('/', (req, res) => {
  let alertsHtml = alerts.map(alert => `<li>${alert}</li>`).join('');
  let html = `
    <html>
      <head>
        <title>Alert System</title>
        <script>
          function refreshAlerts() {
            fetch('/alerts')
              .then(response => response.json())
              .then(data => {
                const alertsList = document.getElementById('alerts');
                alertsList.innerHTML = data.map(alert => '<li>' + alert + '</li>').join('');
              });
          }

          function clearAlerts() {
            fetch('/clear-alerts', { method: 'POST' })
              .then(() => refreshAlerts());
          }

          // Refresh alerts every 5 seconds
          setInterval(refreshAlerts, 5000);
        </script>
      </head>
      <body>
        <h1>Alert System</h1>
        <button onclick="refreshAlerts()">Refresh Alerts</button>
        <button onclick="clearAlerts()">Clear Alerts</button>
        <ul id="alerts">
          ${alertsHtml}
        </ul>
      </body>
    </html>
  `;
  res.send(html);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

console.log('Cron jobs scheduled');