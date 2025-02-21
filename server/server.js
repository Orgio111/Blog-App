const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const authenticateToken = require("./authMiddleware");
const User = require("./models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Orgio1295",
    database: "blog_db"
});

const updateUser = (req, res) => {
    const { id } = req.params;
    res.json({ message: `Хэрэглэгчийн ID ${id} амжилттай шинэчлэгдлээ.` });
};

app.put("/user/:id", updateUser);


db.connect(err => {
    if (err) {
        console.error("MySQL холбогдоогүй:", err);
    } else {
        console.log("MySQL амжилттай холбогдлоо!");
    }
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');

        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) return res.status(500).send('Error adding user');
            res.status(201).send('User created');
        });
    });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "Хэрэглэгч олдсонгүй!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Буруу нууц үг!" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Серверийн алдаа!" });
    }
});

app.put('/articles/:id', (req, res) => {
    const articleId = req.params.id;
    const { title, content } = req.body;

    Article.update({ title, content }, {
        where: { id: articleId },
    })
        .then((updated) => {
            if (updated) {
                res.status(200).json({ message: 'Нийтлэл амжилттай шинэчлэгдлээ.' });
            } else {
                res.status(404).json({ message: 'Нийтлэл олдсонгүй.' });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: 'Алдаа гарлаа.', error: err });
        });

    Article.findByPk(articleId)
        .then((article) => {
            if (!article) {
                return res.status(404).json({ message: 'Нийтлэл олдсонгүй.' });
            }
        })
        .catch((err) => res.status(500).json({ message: 'Алдаа гарлаа.', error: err }));

});


app.put("/user/:id", (req, res) => {
    const { id } = req.params;
    res.send(`Хэрэглэгчийн ID: ${id} шинэчлэгдлээ.`);
});


app.put("/update", (req, res) => {
    res.send("PUT хүсэлт амжилттай!");
});


app.get("/posts", (req, res) => {
    db.query("SELECT * FROM posts", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.post("/posts", (req, res) => {
    const { title, content } = req.body;
    db.query("INSERT INTO posts (title, content) VALUES (?, ?)", [title, content], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Нийтлэл амжилттай нэмэгдлээ!", id: result.insertId });
    });
});

app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM posts WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Нийтлэл амжилттай устгагдлаа' });
    });
});

app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Нийтлэл устгах хүсэлт: ${id}`);
    db.query('DELETE FROM posts WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Алдаа устгах үед:', err);
            return res.status(500).send(err);
        }
        console.log('Нийтлэл амжилттай устгалаа:', result);
        res.json({ message: 'Нийтлэл амжилттай устгагдлаа' });
    });
});


app.listen(5000, () => {
    console.log("Backend сервер 5000 порт дээр ажиллаж байна!");
});
