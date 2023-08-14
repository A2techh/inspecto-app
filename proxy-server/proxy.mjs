// // proxy.js
// import express from "express";
// import axios from "axios";
// import cors from "cors";

// const app = express();
// const PORT = 4000; // Choose a port for the proxy server

// app.use(express.json());

// // Enable CORS for all routes
// app.use(cors());

// // Proxy endpoint for PTZ control
// app.get('/ptzctrl', async (req, res) => {
//   try {
//     const { direction } = req.query;
//     const cameraURL = `http://192.168.88.77/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=${direction}&-speed=45`;

//     const response = await axios.get(cameraURL, {
//       auth: {
//         username: 'admin',
//         password: 'admin',
//       },
//     });

//     res.send(response.data);
//   } catch (error) {
//     console.error('Error moving camera:', error.message);
//     res.status(500).json({ error: 'Error moving camera' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Proxy server listening on port ${PORT}`);
// });

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000; // Choose a port for the proxy server

app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for PTZ control
app.get('/ptzctrl', async (req, res) => {
  try {
    const { direction } = req.query;
    const cameraURL = `http://192.168.88.77/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=${direction}&-speed=45`;

    const response = await axios.get(cameraURL, {
      auth: {
        username: 'admin',
        password: 'admin',
      },
    });

    res.send(response.data);
  } catch (error) {
    console.error('Error moving camera:', error.message);
    res.status(500).json({ error: 'Error moving camera' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
