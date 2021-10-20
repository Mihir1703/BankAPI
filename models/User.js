const DBconnect = require('../database/Connection')

let User = {
    create : async ({uid,fname,lname,email,contact,password,address},callback)=>{
        DBconnect.query(`insert into user(uid,fname,lname,address,contact,email,password) values(${uid},"${fname}","${lname}","${address}",${contact},"${email}","${password}")`,(err,data)=>{
            if(err) callback(err,null);
            else{
                DBconnect.query(`select account_no from user where uid = ${uid}`,(err2,info)=>{
                    if(err) callback(err2,null);
                    else{
                        callback(null,info[0].account_no);
                    }
                })
            }
        })
    },
    findByUID : async ({uid,contact},callback)=>{
        DBconnect.query(`select * from user where uid = ${uid} and contact = ${contact}`,(err,data)=>{
            if(err) callback(err,null)
            if(data.length == 0){
                callback(null,null)
            }else{
                callback(null,data)
            }
        })
    },
    findByAccNo : async ({account_no},callback)=>{
        DBconnect.query(`select * from user where account_no = ${account_no}`,(err,data)=>{
            if(err) callback(err,null)
            if(data.length == 0){
                callback(null,null)
            }else{
                callback(null,data[0]);
            }
        })
    },
    showBalance : async ({account_no},callback)=>{
        DBconnect.query(`select balance from user where account_no = ${account_no}`,(err,data)=>{
            if(err) callback(err,null);
            else{
                if(data == null){
                    callback(null,{
                        not_exist:true
                    })
                }else{
                    callback(null,{
                        not_exist:false,
                        balance:data[0].balance
                    })
                }
            }
        })
    }
}

module.exports = User