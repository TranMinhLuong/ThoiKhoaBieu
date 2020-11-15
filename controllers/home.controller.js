var connection = require('../connection.js');

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

module.exports = {
    edit_password: (req, res) => {
        var pass_old = req.body.pass_old;
        var pass_new = req.body.pass_new;
        var sql = "UPDATE `tai_khoan` SET `mat_khau`='" + pass_new + "' WHERE `mat_khau`='" + pass_old + "' AND ten_tai_khoan='" + req.body.user + "'";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect(req.body.path);
        })
    },

    calendar: (req, res) => {
        var sql = "SELECT lich_hoc.*,lop_hoc_phan.*,phong_hoc.ten_phong FROM `giao_vien`,`lich_hoc`,`lop_hoc_phan`,`phong_hoc` WHERE phong_hoc.ma_phong=lich_hoc.ma_phong AND lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND giao_vien.mgv=lich_hoc.mgv AND giao_vien.email='" + res.locals.user + "'"
        connection.query(sql, (err, rows) => {
            var myRRow = rows.map(a => {
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
            console.log(myRRow);
            if (err) throw err;
            res.render('pageTeacher/calendar', {
                title: "Lịch Dạy",
                lich_day: myRRow,
            })
        })
    },

    point: (req, res) => {
        var sql = "SELECT DISTINCT lop_hoc_phan.*,mon_hoc.ten_mon_hoc FROM " +
            "`mon_hoc`,`giao_vien`,`lich_hoc`,`lop_hoc_phan` WHERE " +
            "mon_hoc.ma_mon_hoc=lop_hoc_phan.ma_mon_hoc AND " +
            "lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND " +
            "giao_vien.mgv=lich_hoc.mgv AND giao_vien.email='" + res.locals.user + "'"
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('pageTeacher/point', {
                title: "Nhập Điểm",
                lop_hp: rows,
            })
        })
    },

    dangKyLich: (req, res) => {
        var sql = "SELECT * FROM `giao_vien` AS gv,`lich_hoc` as lh," +
            "`lop_hoc_phan` as lhp,`phong_hoc`,`lop` where phong_hoc.ma_phong=lh.ma_phong " +
            "AND lh.`ma_lop_hp` = lhp.`ma_lop_hp` AND lh.mgv = gv.mgv AND lh.ma_lop = lop.id;";
        connection.query(sql, (err, rows) => {
            var myRRow = rows.map(a => {
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
            if (err) throw err;
            var sql_mh = "SELECT * FROM `mon_hoc`"
            connection.query(sql_mh, (err, mon_hoc) => {
                if (err) throw err;
                var listDate = [
                    ['CN', 'Chủ Nhật'],
                    ['T2', 'Thứ Hai'],
                    ['T3', 'Thứ Ba'],
                    ['T4', 'Thứ Tư'],
                    ['T5', 'Thứ Năm'],
                    ['T6', 'Thứ Sáu'],
                    ['T7', 'Thứ Bảy'],
                ];
                var sql = "SELECT * FROM `phong_hoc`";
                connection.query(sql, (err, phong) => {
                    if (err) throw err;
                    console.log(res.locals.notification)
                    var sql = "SELECT * FROM `lop`";
                    connection.query(sql, (err, lop) => {
                        if (err) throw err;
                        res.render('pageTeacher/dangkylich', {
                            title: 'Đăng Ký Lịch',
                            user: res.locals.user,
                            calendars: myRRow,
                            subjects: mon_hoc,
                            listDate: listDate,
                            rooms: phong,
                            lop: lop,
                            notification: res.locals.notification,
                        })
                    })
                })
            })
        })
    },

    calendar_add: (req, res) => {
        var sql = "INSERT INTO `lich_hoc`(`tiet_hoc`, `buoi_hoc`,`thoi_gian`, `ma_phong`, `ma_lop_hp`, `mgv`, `ma_lop`) VALUES (?,?,?,?,?,?,?)";
        var calendar = [
            req.body.bat_dau + "->" + req.body.ket_thuc,
            req.body.buoi_hoc,
            req.body.thuadd,
            req.body.phong,
            req.body.lop_hp,
            req.body.giao_vien,
            req.body.lop,
        ];

        var sqlCheck = "SELECT * FROM `lich_hoc` WHERE `tiet_hoc` = '" + req.body.bat_dau +
            "->" + req.body.ket_thuc + "'" + " OR ( `thoi_gian`='" +
            req.body.thuadd + "' AND `buoi_hoc`='" + req.body.buoi_hoc +
            "' AND `ma_phong`= '" + req.body.phong + "' AND `mgv`= '" + req.body.giao_vien + "' )"
        connection.query(sqlCheck, (err, rows) => {
            if (err) throw err;
            console.log(sqlCheck)
            console.log(rows.length)
            if (rows.length == 0) {
                connection.query(sql, calendar, (err, result) => {
                    if (err) throw err;
                    res.cookie('notification', "Thêm Lịch Thành Công", {
                        signed: true
                    });
                    res.redirect("/home/register-calendar");
                })
            } else {
                res.cookie('notification', "Lịch Tồn Tại", {
                    signed: true
                });
                res.redirect("/home/register-calendar");
            }

        })
    },
}