const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'),{index:false}));

app.get('/', (req, res) => {
    res.redirect('/login.html')
})

app.get('/api/test', (req, res) => {
    res.json({ message: 'harika şuan express apı çalışıyor', status: 'success' });
});


app.post('/api/login',(req,res) =>{
    const {email,password}=req.body;

    if(!email || !password){
        return res.status(400).json({message:'email veya şifrenzden biri boş lütfen doldurunuz !'});
    }
    const sqlSorgu=`SELECT * FROM users WHERE email= ? AND password=?`;
    db.get(sqlSorgu, [email, password], (hata, kullanici) => {
        if(hata) {
            return res.status(500).json({error: hata.message});
        }
        if(!kullanici) {
            return res.status(401).json({error: 'emailiniz veya şifreniz hatalı lütfen kontrol ediniz !'});
        }
        return res.json({
            message: 'başarılı bir şekilde giriş yaptınız',
            user_id: kullanici.id,
            name: kullanici.name
        });
    });
});


app.post('/api/signup',(req,res) =>{
    const {name,email,password,password_again} =req.body;
    if (!name || !email || !password || !password_again){
        return res.status(400).json({error:'lütfen boş alanları doldurunuz'});

    }
    if(password !=password_again){
        return res.status().json({error:'şifreler birbirleriyle eşleşmiyor  lütfen düzltin'});
    }
    


})

app.listen(PORT, () => {
    console.log(`sunucu kontağı açıldı test için adrese tıkla http://lockalhost:${PORT}`)
}) 