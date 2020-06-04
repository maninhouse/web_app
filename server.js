var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mysql = require('mysql');
var crypto = require('crypto');

var connection = mysql.createConnection({
  host: "localhost",
  user: "Lewis",
  password: "My103Sql",
  database: "website",
  port: "3306"
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var dbConnected = false;
connection.connect(function(err){
  if(err){
    console.log(err.message);
    return;
  }
  else
    //res.end('<p>Connected !</p>');
    dbConnected = true;
});

var logined = false;

app.get('/',function(req, res, next){
    if(dbConnected)
      if(logined)
        res.sendfile("index-logined.html");
      else
        res.sendfile("index.html");
    else
      res.end('<p>Error Connected</p>');
});

app.post('/login',function(req, res, next){
  var sql_injection = (req.body.SQLInjection == '1');
  //console.log(sql_injection);
  var user_name = req.body.user;
  var password = req.body.password;
  password = crypto.createHash('sha256').update(password).digest('hex');

  var query1 = "select * from members where (username = '"+ user_name + "') and (password = '"+ password +"');";
  var query2 = "select * from members where ((username = ?) and (password = ?));";
  // 1' OR '1'='1');#
  if(sql_injection){
    connection.query(query1, function(err, rows, field){
      if(err){
        console.log(err.message);
        res.end("error");
        return;
      }
      else{
        if (rows.length > 0){
          logined = true;
          res.send("登入成功");
        }
        else{
          logined = false;
          res.send("登入失敗");
        }   
      }
    });
  }
  else{
    connection.query(query2, [user_name, password], function(err, rows, field){
      if(err){
        console.log(err.message);
        res.end("error");
        return;
      }
      else{
        if (rows.length > 0){
          logined = true;
          res.send("登入成功");
        }
        else{
          logined = false;
          res.send("登入失敗");
        }
      }
    });
  }
});

app.post('/logout', function(req, res, next){
  logined = false;
  res.redirect('/');
});

app.get('/register',function(req, res, next){
  res.sendfile("register.html");  
});

app.post('/register', function(req, res, next){
  var user_name = req.body.user;
  var password = req.body.password;
  
  password = crypto.createHash('sha256').update(password).digest('hex');
  
  var query = "insert into members values(?,?);";
  
  connection.query(query, [user_name, password], function(err, rows, field){
    if(err){
      console.log(err.message);
      res.end("error");
      return;
    }
    else{
      res.send("註冊成功");
    }
  });
});

app.listen(3000, function(){
  console.log("Started on PORT 3000");
})