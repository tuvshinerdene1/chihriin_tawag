const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const db = require('./config/db');

app.get('/', (req, res) => {
    res.send('Hello from express');
});

app.get('/test-db', async(req, res)=>  {
    try{
        const result = await db.query('SELECT NOW()');
        res.json({
            success:true,
            message: 'Database connected successfully.',
            currentTime: result.rows[0].now
            
        });
    } catch(err){
        console.error('Database quey error:', err.message);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});

