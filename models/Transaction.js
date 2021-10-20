const DBconnect = require('../database/Connection')
const User = require('./User')

let transaction = {
    transfer : async ({account_no,recievers_account_no,amount},callback)=>{
        await User.showBalance({account_no},(err,data)=>{
            if(err) {
                callback(err,null);
            }else{
                if(data.balance < amount){
                    callback(null,false);
                }else{
                    DBconnect.query(`update user set balance = balance - ${amount} where account_no = ${account_no}`,(err,data)=>{
                        if(!err){
                            DBconnect.query(`update user set balance = balance + ${amount} where account_no = ${recievers_account_no}`,(err,data2)=>{
                                if(!err){
                                    callback(null,true);
                                }
                            })
                        }
                    })
                }
            }
        })
    }
}

module.exports = transaction