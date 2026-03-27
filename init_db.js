const fs=require('fs');
const path=require('path');

const db=require('./db');

const sqlpath=path.join(__dirname,'schema.sql');
const schema=fs.readFileSync(sqlpath,'utf8');

console.log('tablo sorguları çalışıyor')

db.exec(schema,(err) =>{
    if(err){
        console.error(`tablolar kurulamadı err: ${err.message}`)
    }
    else{
        console.log('tablolar başarılı bir şekilde kuruldu')
    }

    db.close();
});

