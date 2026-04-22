const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');
const { error } = require('console');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/', (req, res) => {
    res.redirect('/login.html')
})

app.get('/api/test', (req, res) => {
    res.json({ message: 'harika şuan express apı çalışıyor', status: 'success' });
});


app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'email veya şifrenzden biri boş lütfen doldurunuz !' });
    }
    const sqlSorgu = `SELECT * FROM users WHERE email= ? AND password=?`;
    db.get(sqlSorgu, [email, password], (hata, kullanici) => {
        if (hata) {
            return res.status(500).json({ error: hata.message });
        }
        if (!kullanici) {
            return res.status(401).json({ error: 'emailiniz veya şifreniz hatalı lütfen kontrol ediniz !' });
        }
        return res.json({
            message: 'başarılı bir şekilde giriş yaptınız',
            user_id: kullanici.id,
            name: kullanici.name
        });
    });
});


app.post('/api/signup', (req, res) => {
    const { name, email, password, password_again } = req.body;
    if (!name || !email || !password || !password_again) {
        return res.status(400).json({ error: 'lütfen boş alanları doldurunuz' });

    }
    if (password != password_again) {
        return res.status(400).json({ error: 'şifreler birbirleriyle eşleşmiyor  lütfen düzltin' });
    }

    const emailsql = 'SELECT * FROM users WHERE email=?';
    db.get(emailsql, [email], (hata, kullanici) => {
        if (hata) {
            return res.status(500).json({ error: `teknik hata : ${hata.message}` });
        }
        if (kullanici) {
            return res.status(409).json({ message: 'böyle bir email zaten var lütfen başka bir mail giriniz' });
        }

        const insertSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

        db.run(insertSql, [name, email, password], (hata) => {
            if (hata) {
                return res.status(500).json({ error: `veritabanına başarılı bir şekilde kaydedilemedi err: ${hata.message}` });
            }
            return res.status(201).json({ message: 'başarılı bir şekilde kaydedildi' })
        });
    });
})

app.post('/api/categories', (req, res) => {
    const { userId, name, type } = req.body;
    const insertCategory = 'INSERT INTO categories(user_id,name,type) VALUES(?,?,?)';
    db.run(insertCategory, [userId, name, type], function (hata) {
        if (hata) {
            return res.status(500).json({ error: 'veritabanından teknik hatalar sözkonusudur' });
        }
        return res.status(201).json({
            message: 'kategoriniz veritabanına başarılı bir şekilde kaydedilmiştir.',
            name: name,
            type: type,
            categoryId: this.lastID
        });
    })
})

app.post('/api/budgets', (req, res) => {
    const { userId, categoryId, montlyLimit, date } = req.body;
    const insertBudget = 'INSERT INTO BUDGETS(user_id,category_id,monthly_limit,month_year) VALUES(?,?,?,?)';
    db.run(insertBudget, [userId, categoryId, montlyLimit, date], function (hata) {
        if (hata) {
            return res.status(500).json({ error: 'veritabanından teknik hatalar sözkonusudur' });
        }
        return res.status(201).json({
            message: 'kategoriniz veritabanına başarılı bir şekilde kaydedilmiştir.',
            montlyLimit: montlyLimit

        });

    })
})

app.get('/api/categories/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT c.*, b.monthly_limit 
        FROM categories c 
        LEFT JOIN budgets b ON c.id = b.category_id 
        WHERE c.user_id = ?
    `;
    db.all(sql, [userId], (hata, kategoriler) => {
        if (hata) {
            return res.status(500).json({ error: hata.message });
        }
        return res.json(kategoriler);
    });
});

app.post('/api/transactions', (req, res) => {
    const { user_id, category_id, type, description, amount, transaction_date } = req.body;

    if (!user_id || !category_id || !type || !amount || !transaction_date) {
        return res.status(400).json({ error: 'Lütfen zorunlu alanları doldurun.' });
    }

    const insertSql = `INSERT INTO transactions (user_id, category_id, type, description, amount, transaction_date) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(insertSql, [user_id, category_id, type, description, amount, transaction_date], function (hata) {
        if (hata) {
            return res.status(500).json({ error: hata.message });
        }

        let updateQuery = "";
        if (type === 'income') {
            updateQuery = `UPDATE users SET total_income = total_income + ?, net_balance = net_balance + ? WHERE id = ?`;
        } else {
            updateQuery = `UPDATE users SET total_expense = total_expense + ?, net_balance = net_balance - ? WHERE id = ?`;
        }

        db.run(updateQuery, [amount, amount, user_id], function (updateHata) {
            if (updateHata) {
                return res.status(500).json({ error: 'İşlem eklendi ama bakiye güncellenemedi.' });
            }
            return res.status(201).json({ message: 'İşlem başarıyla eklendi ve bakiye güncellendi.' });
        });
    });
});
app.get('/api/transactions/:userId/recent', (req, res) => {
    const userId = req.params.userId;
    const getTransactions = 'SELECT * FROM transactions WHERE user_id= ? ORDER BY transaction_date DESC LIMIT 10';
    db.all(getTransactions, [userId], (hata, işlemler) => {
        if (hata) {
            return res.status(500).json({ error: hata.message })
        }
        return res.json(işlemler)
    })
})
app.get('/api/balance/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
            SELECT 
                 SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
                 SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
            FROM TRANSACTIONS
            WHERE user_id=?`

    db.get(query, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const totalIncome = row.total_income || 0;
        const totalExpense = row.total_expense || 0;
        return res.json({
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            balance: totalIncome - totalExpense
        });
    })
})

app.listen(PORT, () => {
    console.log(`sunucu kontağı açıldı test için adrese tıkla http://localhost:${PORT}`)
}) 