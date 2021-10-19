const express = require('express')
const router = express.Router()
const config = require('../app-config.json');
const bcrypt = require('bcryptjs');
const status_code = require('http-status-codes')
const { body, validationResult } = require('express-validator');
const User = require('../models/User')
var jwt = require('jsonwebtoken');

router.post('/create',[
    body('uid','Enter a valid UID').isLength({min:16,max:16}),
    body('fname','Enter a valid Name').isLength({min:2}),
    body('lname','Enter a valid Name').isLength({min:2}),
    body('email','Enter a valid email').isEmail(),
    body('address','Enter a valid email').isLength({min:3}),
    body('contact','Enter a valid contact').isLength({max:10,min:10}),
    body('password','Enter password between 5-20').isLength({min:5,max:20})
],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(status_code.StatusCodes.BAD_REQUEST).json({
            success:false,
            errors:errors.array()
        })
    }
    await User.findByUID({uid:req.body.uid,contact:req.body.contact},async (err,data)=>{
        if(err){
            res.status(status_code.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success:false
            })
            return
        }
        if(data == null){
            const salt = await bcrypt.genSalt(config.password_hashing.salt);
            const secPass = await bcrypt.hash(req.body.password, salt);
            User.create({
                uid:req.body.uid,
                fname:req.body.fname,
                lname:req.body.lname,
                email:req.body.email,
                contact:req.body.contact,
                address:req.body.address,
                password:secPass,
            },(err,data)=>{
                if(data){
                    res.status(status_code.StatusCodes.OK).json({
                        success:true,
                        account_no:`MSB${data}`
                    })
                }
            })
        }else{
            res.status(status_code.StatusCodes.NOT_ACCEPTABLE).json({
                success:false,
                message:"User already exists"
            })
            return
        }
    })
})

router.post('/login',[
    body('password', 'Password cannot be blank').exists(),
    body('account_no','Enter correct account number').exists()
],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(status_code.StatusCodes.BAD_REQUEST).json({
            success:false,
            errors:errors.array()
        })
    }
    let acc_no = ""
    for(let i=3;i<req.body.account_no.length;i++){
        acc_no += req.body.account_no[i];
    }
    await User.findByAccNo({
        account_no:acc_no
    },async (err,data)=>{
        if(err){
            res.status(status_code.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success:false
            })
        }else{
            const passwordCompare = await bcrypt.compare(req.body.password, data.password);
            if(!passwordCompare){
                res.status(status_code.StatusCodes.BAD_REQUEST).json({ success:false, error: "Please try to login with correct credentials" });
            }else{
                const send = {
                    user: {
                        account_no:data.account_no
                    }
                }
                const authtoken = jwt.sign(send, config.JWT_SECRET);
                res.status(status_code.StatusCodes.OK).json({ success:true, authtoken })
            }
        }
    })
})

module.exports = router