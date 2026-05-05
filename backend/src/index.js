const express = require('express');
const cors = require('cors');

require('./db/database');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/nodes', require('./routes/nodes'));
app.use('/api/edges', require('./routes/edges'));
app.use('/api/graph', require('./routes/graph'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SAP Knowledge API running on http://localhost:${PORT}`));
