const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const app = express();
const PORT = 5000;

// MongoDB connection
const uri =
  'mongodb+srv://ilababiev42366:root@lab4.nzcum5j.mongodb.net/?retryWrites=true&w=majority&appName=lab4';
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('repairDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

// Подключаемся к БД при старте сервера
let db;
connectDB().then((database) => {
  db = database;
  app.listen(PORT, () => {
    console.log(`Database Service running on port ${PORT}`);
  });
});

// Clients endpoints
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.collection('clients').find().toArray();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    console.log('Received data:', req.body); // Логируем входящие данные

    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newClient = {
      name: req.body.name,
      phone: req.body.phone,
      createdAt: new Date(),
    };

    const collection = db.collection('clients');
    const result = await collection.insertOne(newClient);

    console.log('Insert result:', result); // Логируем результат

    res.status(201).json({
      _id: result.insertedId,
      ...newClient,
    });
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({
      error: 'Database error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// Contractors endpoints
app.get('/api/contractors', async (req, res) => {
  try {
    const contractors = await db.collection('contractors').find().toArray();
    res.json(contractors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contractors', async (req, res) => {
  try {
    console.log('Получены данные подрядчика:', req.body);

    if (!req.body.name || !req.body.specialization) {
      return res.status(400).json({
        error: 'Необходимо указать имя и специализацию',
        received: req.body,
      });
    }

    const newContractor = {
      name: req.body.name,
      specialization: req.body.specialization,
      createdAt: new Date(),
    };

    const result = await db.collection('contractors').insertOne(newContractor);

    if (!result.insertedId) {
      throw new Error('Не удалось сохранить подрядчика');
    }

    res.status(201).json({
      _id: result.insertedId,
      ...newContractor,
    });
  } catch (err) {
    console.error('Ошибка MongoDB:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// Object types endpoints
app.get('/api/object-types', async (req, res) => {
  try {
    const objectTypes = await db.collection('objectTypes').find().toArray();
    res.json(objectTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/object-types', async (req, res) => {
  try {
    // Добавляем базовую валидацию
    if (!req.body.name) {
      return res
        .status(400)
        .json({ error: "Поле 'name' обязательно для заполнения" });
    }

    const newObjectType = {
      name: req.body.name,
      createdAt: new Date(),
    };

    const result = await db.collection('objectTypes').insertOne(newObjectType);

    // Исправленный ответ для MongoDB driver v4+
    res.status(201).json({
      _id: result.insertedId,
      ...newObjectType,
    });
  } catch (err) {
    console.error('Ошибка при создании типа объекта:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: err.message,
    });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const materials = await db.collection('materials').find().toArray();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    // Валидация полей
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({
        error: "Поля 'name' и 'price' обязательны для заполнения",
        received: req.body,
      });
    }

    // Преобразуем цену в число
    const price = parseFloat(req.body.price);
    if (isNaN(price)) {
      return res.status(400).json({ error: 'Цена должна быть числом' });
    }

    const newMaterial = {
      name: req.body.name,
      price: price, // Сохраняем как число
      createdAt: new Date(),
    };

    const result = await db.collection('materials').insertOne(newMaterial);

    // Исправленный формат ответа для MongoDB driver v4+
    res.status(201).json({
      _id: result.insertedId,
      ...newMaterial,
    });
  } catch (err) {
    console.error('Ошибка при добавлении материала:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    // Добавляем сортировку по дате создания (новые сверху)
    const orders = await db
      .collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: err.message,
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Валидация входящих данных
    if (
      !req.body.clientId ||
      !req.body.contractorId ||
      !req.body.objectTypeId
    ) {
      return res.status(400).json({
        error:
          'Не заполнены обязательные поля: clientId, contractorId, objectTypeId',
      });
    }

    const newOrder = {
      clientId: req.body.clientId,
      contractorId: req.body.contractorId,
      objectTypeId: req.body.objectTypeId,
      area: parseFloat(req.body.area) || 0,
      materialIds: Array.isArray(req.body.materialIds)
        ? req.body.materialIds
        : [],
      totalCost: parseFloat(req.body.totalCost) || 0,
      status: req.body.status || 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(newOrder);

    res.status(201).json({
      _id: result.insertedId,
      ...newOrder,
    });
  } catch (err) {
    console.error('Ошибка при создании заказа:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: err.message,
    });
  }
});

app.get('/api/materials/:id', async (req, res) => {
  try {
    // Преобразуем строковый ID в ObjectId
    const material = await db
      .collection('materials')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({
      error: 'Database error',
      details: err.message,
    });
  }
});
