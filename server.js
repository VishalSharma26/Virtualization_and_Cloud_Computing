const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint to deploy code
app.post('/deploy', (req, res) => {
    const { code, filename } = req.body;
    if (!code || !filename) {
        return res.status(400).send('Code and filename are required.');
    }
    fs.writeFileSync(`./${filename}`, code, 'utf8');
    res.send('Code deployed successfully.');
});

// Endpoint to execute a command
app.post('/execute', (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).send('Command is required.');
    }
    console.log(`Executing command: ${command}`);
    res.send(`Command "${command}" executed successfully.`);
});

// Endpoint to orchestrate across VMs
app.post('/orchestrate', async (req, res) => {
    const { vms, code, filename, command } = req.body;
    if (!vms || !code || !filename) {
        return res.status(400).send('VMs, code, and filename are required.');
    }
    try {
        for (const vm of vms) {
            await axios.post(`${vm}/deploy`, { code, filename });
            if (command) {
                await axios.post(`${vm}/execute`, { command });
            }
        }
        res.send('Deployment and operations completed.');
    } catch (err) {
        res.status(500).send('Error during orchestration.');
    }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
