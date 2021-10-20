const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const status_code = require('http-status-codes')
const { body, validationResult } = require('express-validator');
const User = require('../models/User')
const transaction = require('../models/Transaction')
const fetchuser = require('../middleware/fetchuser')

router.post('/send',[
    body('password', 'Password cannot be blank').exists(),
    body('reciver_account_no','Enter correct account number').exists(),
    body('amount','use a valid balance').isNumeric()
],fetchuser,async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(status_code.StatusCodes.BAD_REQUEST).json({
            success:false,
            errors:errors.array()
        })
    }
    let acc_no = req.access,racc_no = "";
    for(let i=3;i<req.body.reciver_account_no.length;i++){
        racc_no += req.body.reciver_account_no[i];
    }
    await User.findByAccNo({
        account_no:acc_no
    },async (err,data)=>{
        if(err){
            res.status(status_code.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success:false
            })
        }else{
            if(acc_no == racc_no){
                res.status(status_code.StatusCodes.METHOD_NOT_ALLOWED).json({
                    success:false,
                    message:"self transaction not allowed"
                })
                return
            }
            const passwordCompare = await bcrypt.compare(req.body.password, data.password);
            if(!passwordCompare){
                res.status(status_code.StatusCodes.BAD_REQUEST).json({ success:false, error: "Please try to login with correct credentials" });
            }else{
                await User.findByAccNo({account_no:racc_no},(err,data2)=>{
                    if(err){
                        res.status(status_code.StatusCodes.INTERNAL_SERVER_ERROR).json({
                            success:false
                        })
                    }else{
                        if(data2 != null){
                            transaction.transfer({
                                account_no:acc_no,
                                recievers_account_no:racc_no,
                                amount:req.body.amount
                            },(err,data)=>{
                                if(!err){
                                    if(data == true){
                                        transaction.lastTransaction({account_no:acc_no,recievers_account_no:racc_no},(error,ids)=>{
                                            if(!error){
                                                res.status(status_code.StatusCodes.OK).json({
                                                    success:data,
                                                    message:"Successfully transfered to target account",
                                                    transaction_id:ids
                                                })
                                            }
                                            return;
                                        })
                                    }
                                    else{
                                        res.status(status_code.StatusCodes.OK).json({
                                            success:data,
                                            message:"Insufficient balance"
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
})

module.exports = router