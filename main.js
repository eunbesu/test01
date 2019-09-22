let fs = require("fs")
let express = require('express')
let app = express()

// node.js를 위한 mysql 커넥터(모니터)
let mysql = require("mysql")
// handlebars 라는 템플릿엔진
let hbs  = require('express-handlebars')
var cookieParser = require('cookie-parser')
let sessionParser = require('express-session')

// 미들웨어 두가지 1) 공통미들웨어 2) 선택적미들웨어

// 쿠키를 파싱하는행위는 어디서나필요 => 공통미들웨어로 등록 app.use
app.use(cookieParser())

// 세션 파싱행위도 공통미들웨어 등록 -> 클라이언트의 id, pw 정보를 서버가 받아서 사물함에 넣어놓고 secret코드 이용해서 
app.use(sessionParser({
    secret: "ASD(F#KRR(GSFKSDF(DSF(",   //세션 키를 만들어낼 알고리즘에 사용될 비밀키
    resave: true,  //중요x
    saveUninitialized: true,  //중요x
}))

// mysql 접속
let connection = mysql.createConnection({
    host     : 'mydbinstance.cgaxgwvnkrkt.ap-northeast-2.rds.amazonaws.com',
    user     : 'eunbesu',
    password : '*',
    database : 'test'
})

connection.connect() // mysql 연결

connection.query("select * from users;", function(err, rows){
    console.log(rows)
})

// express 에 hbs 템플릿엔진 세팅부분 ( 중요하지 않은 부분 )
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: false,
}))
app.set('view engine', 'hbs')

/*
    0) 쿠키파서원리
        %$$name=%(@)#kihyun  을 { name : "kihyun" } 으로 바꿔주는 행위임 (단순 인코딩)
    1) 선택적미들웨어 공통미들웨어
    2) db mysql모니터 mysql서버개념 그리고 mysql모니터를 node.js 로 실행하는법
    3) 템플릿엔진 원리, hbs 사용법
    4) 세션
    5) 스태틱(정적) 파일 서비스하기
*/

// 미들웨어함수 (선택적 미들웨어)
var middle = function(req, res, next){
    console.log("미들웨어를 거쳐갑니다")
    next()
}

//   /public/test.css  /public/user.js 처럼 접두사가 /public 이면 public 폴더에서 찾아서 보내줌
app.use("/public", express.static("public")) // 정적파일을 보내는법

// 세션 체킹
app.get("/", function(req, res){
    console.log(req.session.user)
    res.send("ok")
})

// 세션 파괴 (사물함 파괴)
app.get("/logout", function(req, res){
    req.session.destroy()
    res.send("dest")
})

// app.get("/login", function(req, res){
//     fs.readFile("login.html", function(err, data){
//         res.send(data.toString())
//     })
// })

var real_id = "eun"
var real_pw = "123123"

app.get("/loginprocess", function(req, res){
    if(req.query.myid == real_id && req.query.mypw == real_pw){
        // res.cookie("user", { login : true })

        // 세션 발급
        req.session.user = {
            name : "kihyun",
            age : 27,
            height : 176,
        }
        res.redirect("/")
    } else {
        res.redirect("/login")
    }
})


// 템플릿엔진의 사용 res.render
app.get("/user", function(req, res){
    res.render("user", {
        name : "김기현",
        age : 27
    })
    /*
        res.render 가 하는일
        1) fs.readFile 을통해 views 폴더의 user.hbs 읽어옴
        2) 세팅된 템플릿엔진한테 넘겨서 {{ 콧수염 }} 으로 완성된 html 파일을 만들어냄
        3) res.send() 로 보냄
    */
})

// 템플릿엔진 반복문 사용
app.get("/boards", function(req, res){
    connection.query("select * from dept", function(err, rows){
        res.render("dept", {
            rows : rows
        })
    })
})

// 이거이 위의 템플린엔진 반복문으로 대체됨
app.get("/boards", function(req, res){

    let html = ""

    connection.query("select * from boards", function(err, rows){
        for(let i = 0; i < rows.length; i++){
            html = html + "<p>"

            html = html + "<h3>" + rows[i].title + "</h3>"

            html = html + "<div>" + rows[i].description + "</div>"

            html = html + "</p>"
        }
        res.send(html)
    })

})

app.listen(80, function(){
    console.log("포트를 열었습니다!")
})