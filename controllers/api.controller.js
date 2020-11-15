var connection = require('../connection.js');

module.exports = {
    login: (req, res) => {
        var email = req.body.email;
        var password = req.body.password;
        var sql = "SELECT sinh_vien.*,lop.ten_lop FROM `tai_khoan`,`sinh_vien`,`lop` " +
            "WHERE lop.id=sinh_vien.ma_lop AND sinh_vien.ma_tai_khoan=tai_khoan.id AND " +
            "ten_tai_khoan='" + email + "' AND mat_khau='" + password + "' AND vai_tro=" + 1;
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            if (rows.length == 0) {
                res.send({ error: "Tài khoản không tồn tại" })
                return;
            }
            var date = new Date(rows[0].ngay_sinh)
            rows[0].ngay_sinh = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            console.log(rows[0].ngay_sinh);
            res.send(rows[0]);
        })
    },

    calendarToday: (req, res) => {
        var now = new Date();
        var thu = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        var sql = "SELECT lich_hoc.*,lop_hoc_phan.ten_lop_hp,phong_hoc.ten_phong," +
            "ct_lop_hp.ma_sinh_vien,mon_hoc.ten_mon_hoc FROM `lich_hoc`,`lop_hoc_phan`," +
            "`phong_hoc`,`ct_lop_hp`,`mon_hoc` WHERE phong_hoc.ma_phong=lich_hoc.ma_phong " +
            "AND lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND mon_hoc.ma_mon_hoc=lop_hoc_phan.ma_mon_hoc" +
            " AND ct_lop_hp.ma_lop_hp=lop_hoc_phan.ma_lop_hp AND ct_lop_hp.ma_sinh_vien='" + req.params.msv + "' " +
            "AND mon_hoc.bat_dau <= CURDATE() AND mon_hoc.ket_thuc >= CURDATE() AND lich_hoc.thoi_gian='" + thu[now.getDay() - 1] + "'";
        queryCalendars(res, sql);
    },

    calendar: (req, res) => {
        var sql = "SELECT lich_hoc.*,lop_hoc_phan.ten_lop_hp,phong_hoc.ten_phong," +
            "ct_lop_hp.ma_sinh_vien,mon_hoc.ten_mon_hoc FROM `lich_hoc`,`lop_hoc_phan`," +
            "`phong_hoc`,`ct_lop_hp`,`mon_hoc` WHERE phong_hoc.ma_phong=lich_hoc.ma_phong " +
            "AND lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND mon_hoc.ma_mon_hoc=lop_hoc_phan.ma_mon_hoc" +
            " AND ct_lop_hp.ma_lop_hp=lop_hoc_phan.ma_lop_hp AND ct_lop_hp.ma_sinh_vien='" + req.params.msv + "' " +
            "AND mon_hoc.bat_dau <= CURDATE() AND mon_hoc.ket_thuc >= CURDATE()";
        queryCalendars(res, sql);
    },

    updateSV: (req, res) => {
        console.log(req.body);
        var user = {
            ten: req.body.name,
            ngay_sinh: req.body.birth,
            gioi_tinh: req.body.gender,
            sdt: req.body.sdt,
            dia_chi: req.body.address,
        }
        var sql = "UPDATE sinh_vien SET ? WHERE msv ='" + req.body.msv + "'";
        connection.query(sql, user, (err, rows) => {
            if (err) throw err;
            if (rows.changedRows == 1) {
                res.send(true);
            } else {
                res.send(false);
            }
        })
    },

    edit_password: (req, res) => {
        var user = req.body.email;
        var pass_old = req.body.pass_old;
        var pass_new = req.body.pass_new;
        var sql = "UPDATE `tai_khoan` SET `mat_khau`='" + pass_new + "' WHERE `mat_khau`='" + pass_old + "' AND ten_tai_khoan='" + user + "'";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            if (rows.changedRows == 1) {
                res.send(true);
            } else {
                res.send(false);
            }
        })
    },

    showPoint: (req, res) => {
        var sql = "SELECT diem_hp.*,mon_hoc.ten_mon_hoc FROM `diem_hp`,`mon_hoc` " +
            "WHERE diem_hp.ma_mon_hoc=mon_hoc.ma_mon_hoc AND diem_hp.ma_sinh_vien ='" + req.params.msv + "'";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },

    test: (req, res) => {
        var now = new Date();
        var thu = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        var sql = "SELECT DISTINCT lich_hoc.*,lop_hoc_phan.ten_lop_hp,phong_hoc.ten_phong," +
            "mon_hoc.ten_mon_hoc FROM `lich_hoc`,`lop_hoc_phan`," +
            "`phong_hoc`,`ct_lop_hp`,`mon_hoc` WHERE phong_hoc.ma_phong=lich_hoc.ma_phong " +
            "AND lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND mon_hoc.ma_mon_hoc=lop_hoc_phan.ma_mon_hoc" +
            " AND ct_lop_hp.ma_lop_hp=lop_hoc_phan.ma_lop_hp" +
            " ORDER BY `lich_hoc`.`tiet_hoc` ASC";
        //console.log(thu[now.getDay() - 1]);
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var list = [
                [
                    [],
                    []
                ],
                [
                    [],
                    []
                ],
                [
                    [],
                    []
                ],
                [
                    [],
                    []
                ],
                [
                    [],
                    []
                ],
                [
                    [],
                    []
                ],
                [
                    [],
                    []
                ]
            ];
            rows.forEach((lich_hoc, index) => {
                var time = {};
                var i = thu.indexOf(lich_hoc.thoi_gian);
                time.tiet_hoc = lich_hoc.tiet_hoc;
                time.buoi_hoc = lich_hoc.buoi_hoc;
                time.ten_phong = lich_hoc.ten_phong;
                time.ten_mon_hoc = lich_hoc.ten_mon_hoc
                time.ten_lop_hp = lich_hoc.ten_lop_hp;
                if (lich_hoc.buoi_hoc == "Sáng") {
                    list[i][0].push(time);
                } else {
                    list[i][1].push(time);
                }

            })
            res.send(list);
        })
    }

}

function queryCalendars(res, sql) {
    connection.query(sql, (err, rows) => {
        if (err) throw err;
        var list = [];
        var listmh = [];
        rows.forEach((lich_hoc, index) => {
            var lichhoc = {}
            lichhoc.lich_hoc = [];
            var time = {};
            var i = listmh.indexOf(lich_hoc.ten_mon_hoc);
            if (i == -1) {
                lichhoc.monhoc = lich_hoc.ten_mon_hoc;
                listmh.push(lich_hoc.ten_mon_hoc);
                time.tiet_hoc = lich_hoc.tiet_hoc;
                time.ten_phong = lich_hoc.ten_phong;
                time.thoi_gian = lich_hoc.thoi_gian;
                lichhoc.lich_hoc.push(time);
                list.push(lichhoc);
            } else {
                time.tiet_hoc = lich_hoc.tiet_hoc;
                time.ten_phong = lich_hoc.ten_phong;
                time.thoi_gian = lich_hoc.thoi_gian;
                list[i].lich_hoc.push(time);
            }
        })
        res.send(list);
    })
}