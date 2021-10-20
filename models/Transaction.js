const DBconnect = require('../database/Connection')
const User = require('./User')

let transaction = {
    transfer : async ({account_no,recievers_account_no,amount},callback)=>{
        await User.showBalance({account_no},(err,data)=>{
            if(err) {
                callback(err,false);
            }else{
                if(data.balance < amount){
                    callback(null,false);
                }else{
                    DBconnect.query(`update user set balance = balance - ${amount} where account_no = ${account_no}`,(err,data)=>{
                        if(!err){
                            DBconnect.query(`update user set balance = balance + ${amount} where account_no = ${recievers_account_no}`,(err,data2)=>{
                                if(!err){
                                    DBconnect.query(`insert into transaction(sender_acc,reciever_acc,amount) values(${account_no},${recievers_account_no},${amount})`,(err,data)=>{
                                        if(!err){
                                            callback(null,true)
                                        }
                                    })
                                    
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    lastTransaction : async ({account_no,recievers_account_no},callback)=>{
        let query = `select * from transaction where sender_acc = ${account_no} and reciever_acc = ${recievers_account_no} order by transaction_id desc limit 1`
        DBconnect.query(query,(err,data)=>{
            if(!err){
                callback(null,data[0])
            }else{
                callback(err,null)
            }
        })
    }
}

module.exports = transaction