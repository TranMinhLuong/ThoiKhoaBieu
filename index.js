const express = require('express');
var bodyParser = require('body-parser');
var expressLayouts = require('express-ejs-layouts');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connection = require('./connection.js');
var AdminRouter = require('./routers/admin.router');
var LoginRouter = require('./routers/login.router');
var HomeRouter = require('./routers/home.router');
var APiRouter = require('./routers/api.router');

const app = express();
var http = require('http').createServer(app);

var check = (req, res, next) => {
    if (!req.signedCookies.user) {
        res.redirect('/login');
        return;
    }
    res.locals.user = req.signedCookies.user;
    if (req.signedCookies.notification != undefined) {
        console.log(req.signedCookies.notification)
        res.locals.notification = req.signedCookies.notification;
        res.clearCookie("notification");
    }
    next();
}

app.use(cookieParser('sdfsdSDFD5sf4rt4egrt4drgsdFSD4e5'));

var port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use('/assets', express.static(__dirname + '/public'));
app.use(expressLayouts);
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use('/login', LoginRouter)
app.use('/admin', check, AdminRouter)
app.use('/home', check, HomeRouter)
app.use('/api', APiRouter)

app.use(bodyParser.json());

app.use(
    session({
        secret: 'mySecretKey',
    })
);
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log("Connect success");
});



http.listen(port, () => console.log(`App listening at http://localhost:${port}`));

app.get('/', check, (req, res) => {
    const dates = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    var dateNames = [
        'Chủ Nhật',
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
    ];
    var x = new Date();
    var thu = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    var sql = "SELECT lich_hoc.*,lop_hoc_phan.ten_lop_hp,phong_hoc.ten_phong FROM `giao_vien`,`lich_hoc`,`lop_hoc_phan`,`phong_hoc` WHERE phong_hoc.ma_phong=lich_hoc.ma_phong AND lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND giao_vien.mgv=lich_hoc.mgv AND giao_vien.email='" +
        res.locals.user + "' AND lich_hoc.thoi_gian='" + thu[x.getDay() - 1] + "'"
    connection.query(sql, function(error, results) {
        var myRRow = results.map(a => {
            const now = new Date();
            const i = dates.indexOf(a.thoi_gian);
            now.setDate(now.getDate() - now.getDay() + i);
            a.tenGiCungDc = dateNames[i] + ` (${now.getDate()}/${now.getMonth()}/${now.getFullYear()})`;
            return a;
        }).sort((a, b) => {
            var compareTg = a.thoi_gian.localeCompare(b.thoi_gian);
            if (compareTg != 0) {
                return compareTg;
            }
            return -a.buoi_hoc.localeCompare(b.buoi_hoc);
        });
        if (error) throw error;
        res.render("pageTeacher/home", {
            title: "Home",
            user: res.locals.user,
            lich_day: myRRow,
        });
    });
});


// var myVar = setInterval(CheckLH, 5000);

// function CheckLH() {
//     var x = new Date();
//     // if (x.getDay() == 0) {
//     //truy vấn csdl trừ số tiết 
//     var sql = "SELECT DISTINCT lop_hoc_phan.ten_lop_hp, lop_hoc_phan.ma_mon_hoc, lich_hoc.tiet_hoc, lich_hoc.thoi_gian, lop_hoc_phan.so_gio, lop_hoc_phan.so_tiethp, lop_hoc_phan.da_day, lop_hoc_phan.so_tiet_con_lai " +
//         " FROM `lop_hoc_phan`, `lich_hoc` " +
//         " WHERE lop_hoc_phan.ma_lop_hp = lich_hoc.ma_lop_hp";
//     connection.query(sql, function(error, result) {
//         if (error) throw error;

//         // const t12 = "1->2";
//         // const t23 = "2->3";
//         // const t34 = "3->4";
//         // const t45 = "4->5";
//         // const t56 = "5->6";
//         // const t67 = "6->7";
//         // const t78 = "7->8";
//         // const t89 = "8->9";
//         // const t90 = "9->10";
//         var arr2t = ["1->2", "2->3", "3->4", "4->5", "5->6", "6->7", "7->8", "8->9", "9->10"];
//         for (var i = 0; i < arr2t.length; i++) {
//             console.log(arr2t[i]);
//             var sql = "UPDATE `lop_hoc_phan`, `lich_hoc` SET lop_hoc_phan.so_gio = (lop_hoc_phan.so_gio + 2), lop_hoc_phan.da_day = (lop_hoc_phan.da_day + 2), lop_hoc_phan.so_tiet_con_lai = (lop_hoc_phan.so_tiet_con_lai - 2) WHERE lop_hoc_phan.ma_lop_hp = lich_hoc.ma_lop_hp AND (lich_hoc.tiet_hoc = '" + arr2t[i] + "') AND lop_hoc_phan.so_tiet_con_lai > 0";
//             connection.query(sql, function(error, up) {
//                 if (error) throw error;
//             })
//         }


//     })
// }

// trừ số tiết  rồi đó
setInterval(function() {
    var x = new Date();
    // if (x.getDay() == 0) {
    //truy vấn csdl trừ số tiết 
    var sql = "SELECT DISTINCT lop_hoc_phan.ten_lop_hp, lop_hoc_phan.ma_mon_hoc, lich_hoc.*, lop_hoc_phan.*" +
        " FROM `lop_hoc_phan`, `lich_hoc` " +
        " WHERE lop_hoc_phan.ma_lop_hp = lich_hoc.ma_lop_hp";
    connection.query(sql, function(error, result) {
            if (error) throw error;

            var arr2t = ["1->2", "2->3", "3->4", "4->5", "5->6", "6->7", "7->8", "8->9", "9->10"];
            var arr3t = ["1->3", "2->4", "3->5", "4->6", "5->7", "6->8", "7->9", "8->10"];
            var arr4t = ["1->4", "2->5", "3->6", "4->7", "5->8", "6->9", "7->10"];
            for (var i = 0; i < arr2t.length; i++) {
                console.log(arr2t[i]);
                var sql2t = "UPDATE `lop_hoc_phan`, `lich_hoc` " +
                    "SET lop_hoc_phan.so_gio = (lop_hoc_phan.so_gio - 2), lop_hoc_phan.da_day = (lop_hoc_phan.da_day + 2), lop_hoc_phan.so_tiet_con_lai = (lop_hoc_phan.so_tiet_con_lai - 2)" +
                    "WHERE lop_hoc_phan.ma_lop_hp = lich_hoc.ma_lop_hp AND (lich_hoc.tiet_hoc = '" + arr2t[i] + "') AND lop_hoc_phan.so_tiet_con_lai > 0";
                connection.query(sql2t, function(error, up2t) {
                    if (error) throw error;
                })
            }
            for (var i = 0; i < arr3t.length; i++) {
                var sql3t = "UPDATE `lop_hoc_phan`, `lich_hoc` " +
                    "SET lop_hoc_phan.so_gio = (lop_hoc_phan.so_gio - 3), lop_hoc_phan.da_day = (lop_hoc_phan.da_day + 3), lop_hoc_phan.so_tiet_con_lai = (lop_hoc_phan.so_tiet_con_lai - 3)" +
                    "WHERE lop_hoc_phan.ma_lop_hp = lich_hoc.ma_lop_hp AND (lich_hoc.tiet_hoc = '" + arr3t[i] + "') AND lop_hoc_phan.so_tiet_con_lai > 0";
                connection.query(sql3t, function(err, up3t) {
                    if (err) throw err;
                })
            }
            for (var i = 0; i < arr4t.length; i++) {
                var sql4t = "UPDATE `lop_hoc_phan`, `lich_hoc` " +
                    "SET lop_hoc_phan.so_gio = (lop_hoc_phan.so_gio - 4), lop_hoc_phan.da_day = (lop_hoc_phan.da_day + 4), lop_hoc_phan.so_tiet_con_lai = (lop_hoc_phan.so_tiet_con_lai - 4)" +
                    "WHERE lop_hoc_phan.ma_lop_hp = lich_hoc.ma_lop_hp AND (lich_hoc.tiet_hoc = '" + arr4t[i] + "') AND lop_hoc_phan.so_tiet_con_lai > 0";
                connection.query(sql4t, function(err, up3t) {
                    if (err) throw err;
                })
            }
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                var sql = "INSERT INTO `ctlich_hoc`(`ma_lop_hp`, `buoi_hoc`, `tiet_hoc`, `thoi_gian`, `ma_phong`, `mgv`, `ma_lop`)" +
                    "VALUES ('" + result[i].ma_lop_hp + "','" + result[i].buoi_hoc + "','" + result[i].tiet_hoc + "','" + result[i].thoi_gian + "','" + result[i].ma_phong + "','" + result[i].mgv + "','" + result[i].ma_lop + "')"
                connection.query(sql, (err, added) => {
                    if (err) throw err;
                })
            }

        })
        // }
}, 1000 * 60 * 60 * 24);