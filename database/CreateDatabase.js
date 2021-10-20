const DBconnect = require('./Connection')

module.exports = ()=>{
    DBconnect.query('create table if not exists user(account_no int primary key auto_increment,uid varchar(16) unique,fname varchar(20),lname varchar(20),address longtext,contact bigint,email varchar(40),password longtext,balance int default 1000');
    DBconnect.query('create table if not exists transaction(transaction_id int primary key auto_increment,sender_acc int ,reciever_acc int,amount int,transfer_date timestamp default CURRENT_TIMESTAMP,foreign key (sender_acc) references user(account_no),foreign key (reciever_acc) references user(account_no))')
}