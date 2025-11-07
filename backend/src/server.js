const express = require('express');
const cors = require('cors');
const path = require('path');
const mangaRoutes = require('./routes/manga');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// статика для картинок глав
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// роуты манги
app.use('/api/manga', mangaRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
