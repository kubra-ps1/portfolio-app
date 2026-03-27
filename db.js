const sqlite3=require('sqlite3').verbose()
const path=require('path')
const dbPath=path.resolve(__dirname,'portfolio.db')

const db=new sqlite3.Database(dbPath, (err) =>{
    if (err){
        console.error("veritabanı path hatası",err.message)
    }

    else{
        console.log('sqlite veritabanı bağlantısı başarıyla oluşturulldu ')
    }
});

module.exports = db;