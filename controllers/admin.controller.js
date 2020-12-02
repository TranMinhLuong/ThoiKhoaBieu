var connection = require('../connection.js');
const excel = require('node-excel-export');

const dates = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

var dateNames = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật',
];


module.exports = {

    home: (req, res) => {
        var sql = "SELECT COUNT(msv) AS msv FROM sinh_vien;"
        connection.query(sql, (err, sv) => {
            if (err) throw err;
            var sql = "SELECT COUNT(mgv) AS mgv FROM giao_vien;"
            connection.query(sql, (err, gv) => {
                if (err) throw err;
                var sql = "SELECT * FROM lop;"
                connection.query(sql, (err, lop) => {
                    if (err) throw err;
                    var sql = "SELECT COUNT(id) AS tk FROM tai_khoan;"
                    connection.query(sql, (err, tk) => {
                        if (err) throw err;
                        res.render('page/homead', {
                            title: "Home | Admin",
                            sv: sv[0].msv,
                            gv: gv[0].mgv,
                            lop: lop.length,
                            tk: tk[0].tk,
                            listLop: lop,
                        });
                    })
                })
            })
        })
    },

    calendarSearch: (req, res) => {
        var sql = "SELECT * FROM lop;"
        connection.query(sql, (err, lop) => {
            if (err) throw err;
            var sqlnh = "SELECT * FROM nam_hoc;"
            connection.query(sqlnh, (err, nam_hoc) => {
                if (err) throw err;
                var sqlw = "SELECT MAX(tong_tuan) AS tong_tuan FROM `mon_hoc`;"
                connection.query(sqlw, (err, week) => {
                    if (err) throw err;
                    var sqld = "select * from nam_hoc where nam_hoc.hoc_ky in (select nam_hoc.hoc_ky from nam_hoc where nam_hoc.bat_daunh <= CURDATE() and nam_hoc.ket_thucnh >= CURDATE())";
                    connection.query(sqld, (err, d) => {
                        if (err) throw err;
                        res.render('page/searchCalendar', {
                            title: "Tìm kiếm Lịch Học",
                            lop: lop,
                            term: nam_hoc,
                            toWeek: week[0].tong_tuan,
                            date: d[0].bat_daunh,
                            term: d,
                        })
                    })
                })
            })
        })
    },

    calendarSearch_Post: (req, res) => {
        var to = req.body.to;
        var form = req.body.form;
        var lop = req.body.lop;
        var sql
        console.log(form, to, lop)
        if (typeof(lop) !== 'undefined' && typeof(to) == 'undefined' && typeof(form) == 'undefined') {
            sql = "SELECT * FROM `giao_vien` AS gv,`lich_hoc` as lh, `lop_hoc_phan` as lhp,`phong_hoc`,`lop` ,`mon_hoc`, `nam_hoc`" +
                " where mon_hoc.ma_mon_hoc = lhp.ma_mon_hoc AND phong_hoc.ma_phong=lh.ma_phong AND lh.`ma_lop_hp` = lhp.`ma_lop_hp`" +
                " AND lh.mgv = gv.mgv AND mon_hoc.ma_hoc_ky = nam_hoc.ma_hoc_ky AND  lh.ma_lop = lop.id AND lh.`ma_lop` = " + lop 
        } else {
            sql = "SELECT * FROM `giao_vien` AS gv,`lich_hoc` as lh, `lop_hoc_phan` as lhp,`phong_hoc`,`lop`, nam_hoc" +
                " ,`mon_hoc` where mon_hoc.ma_mon_hoc = lhp.ma_mon_hoc AND phong_hoc.ma_phong=lh.ma_phong AND lh.`ma_lop_hp` = lhp.`ma_lop_hp`" +
                " AND lh.mgv = gv.mgv AND mon_hoc.ma_hoc_ky = nam_hoc.ma_hoc_ky AND  lh.ma_lop = lop.id " +
                " AND lh.tuan_thu = '" + to + "' AND mon_hoc.ma_hoc_ky = '" + form + "' AND lh.`ma_lop` = " + lop 
        }
        connection.query(sql, (err, rows) => {
            var myRRow = rows.map(a => {
                const now = new Date(a.bat_daunh);
                const i = dates.indexOf(a.thoi_gian);
                const w = a.tuan_thu;
                now.setDate(now.getDate() - now.getDay() + i - 6 + w * 7);
                var ngay = (Number(now.getDate()) <= 9) ? "0" + now.getDate() : now.getDate();
                var thang = (Number(now.getMonth() + 1) <= 9) ? now.getMonth() + 1 : now.getMonth() + 1;
                a.tenGiCungDc = dateNames[i] +`<br> (${ngay}/${thang}/${now.getFullYear()})`;
                a.date = new Date(now);
                return a;
            }).sort((a, b) => {
                return (new Date(b.date) - new Date(a.date)) * (-1);
            });
            var sqlLop = "SELECT * FROM lop Where id =" + lop;
            connection.query(sqlLop, (err, cla) => {
                if (err) throw err;
                var sqlNh = "SELECT * FROM nam_hoc WHERE ma_hoc_ky = '" + form + "'";
                console.log(sqlNh);
                connection.query(sqlNh, (err, nh) => {
                    if (err) throw err;
                    res.render('page/ct_LichHoc', {
                        title: "",
                        calender: myRRow,
                        to: to,
                        lop: cla[0],
                        nh: nh[0].bat_daunh
                    })
                })
            })
        })
    },

    calendarAjax: (req, res) => {
        var sql = "SELECT DISTINCT lich_hoc.*,lop_hoc_phan.ten_lop_hp,mon_hoc.so_tiet,giao_vien.ten,phong_hoc.ten_phong," +
            "mon_hoc.ten_mon_hoc,nam_hoc.* FROM `lich_hoc`,`lop_hoc_phan`, `giao_vien`," +
            "`phong_hoc`,`mon_hoc`,`nam_hoc` WHERE phong_hoc.ma_phong=lich_hoc.ma_phong " +
            "AND lop_hoc_phan.ma_lop_hp=lich_hoc.ma_lop_hp AND giao_vien.mgv = lich_hoc.mgv" +
            " AND mon_hoc.ma_mon_hoc=lop_hoc_phan.ma_mon_hoc AND mon_hoc.ma_hoc_ky = nam_hoc.ma_hoc_ky " +
            " AND lich_hoc.`ma_lop` = '" + req.params.lop + "' AND DATE(NOW()) <= DATE_ADD(nam_hoc.bat_daunh, INTERVAL 7*lich_hoc.tuan_thu DAY)" +
            " AND nam_hoc.bat_daunh <= CURDATE() AND nam_hoc.ket_thucnh >= CURDATE()  ORDER BY `lich_hoc`.`tiet_hoc` ASC";
            console.log(sql)
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
            var listmh = [];
            rows.forEach((lich_hoc, index) => {
                var time = {};
                var i = dates.indexOf(lich_hoc.thoi_gian);
                time.tiet_hoc = lich_hoc.tiet_hoc;
                time.buoi_hoc = lich_hoc.buoi_hoc;
                time.ten_phong = lich_hoc.ten_phong;
                time.ten_mon_hoc = lich_hoc.ten_mon_hoc
                time.ten_lop_hp = lich_hoc.ten_lop_hp;
                time.ten = lich_hoc.ten;
                time.so_tiet = lich_hoc.so_tiet;
                time.bat_daunh = lich_hoc.bat_daunh;
                time.tuan_thu = lich_hoc.tuan_thu;
                if (lich_hoc.buoi_hoc == "Sáng") {
                    list[i][0].push(time);
                } else {
                    list[i][1].push(time);
                }
            })
            var sql = "SELECT * FROM lop Where id =" + req.params.lop;
            connection.query(sql, (err, lop) => {
                if (err) throw err;
                res.render('page/calendarAjax', {
                    title: "",
                    lop: lop[0],
                    calender: list
                });
            })

        });
    },

    select: (req, res) => {
        connection.query("SELECT * FROM `" + req.params.table + "`", (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },
    select_addSV: (req, res) => {
        var sql = "SELECT `sinh_vien`.*,`lop`.`ten_lop` FROM `sinh_vien`,`lop` WHERE sinh_vien.ma_lop = lop.id AND `msv` NOT IN(SELECT `ma_sinh_vien` FROM `ct_lop_hp`,`lop_hoc_phan` WHERE ct_lop_hp.`ma_lop_hp`= lop_hoc_phan.ma_lop_hp AND lop_hoc_phan.ma_mon_hoc = '" + req.params.ma_mon_hoc + "')";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },

    insert_addSV: (req, res) => {
        var sql = "INSERT INTO `ct_lop_hp`(`ma_lop_hp`, `ma_sinh_vien`) VALUES ";
        console.log(req.body);
        var listmsv = req.body.msv.split(",");
        var s = [];
        var s2 = [];
        for (var i = 0; i < listmsv.length; i++) {
            s.push("('" + req.body.ma_lop_hp + "','" + listmsv[i] + "')");
            s2.push("('" + req.body.mmh + "','" + listmsv[i] + "')");
        }
        connection.query(sql + s.toString(), (err, rows) => {
            if (err) throw err;
            var sql_diem = "INSERT INTO `diem_hp`(`ma_mon_hoc`, `ma_sinh_vien`) VALUES "
            connection.query(sql_diem + s2.toString(), (error, results) => {
                if (error) throw error;
                res.send(true);
            })
        })
    },

    editSV_lhp: (req, res) => {
        console.log(req.body);
        var sql = "UPDATE `ct_lop_hp` SET `ma_lop_hp`='" + req.body.ma_lop_hp + "' WHERE `id`= " + req.body.id;
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(true);
        })
    },

    lop: (req, res) => {

        connection.query("SELECT * FROM `lop`", (err, rows) => {
            if (err) throw err;
            res.render('page/lop', {
                title: 'Lop',
                user: res.locals.user,
                classes: rows,
            })
        })
    },

    lop_student: (req, res) => {
        var sql = "SELECT sinh_vien.*,lop.ten_lop FROM `sinh_vien`,`lop` WHERE sinh_vien.ma_lop = lop.id AND lop.ten_lop ='" + req.params.lop + "'"
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var sql = "SELECT * FROM `lop`";
            connection.query(sql, (loi, lop) => {
                if (loi) throw loi;
                res.render('page/listStudentClass', {
                    title: req.params.lop,
                    user: res.locals.user,
                    students: rows,
                    classes: lop,
                    ten_lop: req.params.lop,
                })
            })
        })
    },

    account: (req, res) => {

        connection.query("SELECT * FROM `tai_khoan`", (err, rows) => {
            if (err) throw err;
            res.render('page/account', {
                title: 'Account',
                user: res.locals.user,
                accounts: rows,
            })

        })
    },

    edit: (req, res) => {
        console.log(req.body);
        var sql = "UPDATE `lop` SET `ma_lop`= '" + req.body.ma_lop + "',`ten_lop`='" + req.body.tenlop + "' WHERE `id`=" + req.body.edit
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/class");
        })
    },

    add_class: (req, res) => {
        var sql = "INSERT INTO `lop`(`ma_lop`, `ten_lop`) VALUES ('" + req.body.ma_lop + "','" + req.body.ten_lop + "')";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/class");
        })
    },

    delete_class: (req, res) => {
        var sql = "DELETE FROM `lop` WHERE `id`=" + req.params.id;
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/class");
        })
    },

    delete: (req, res) => {
        var sql = "DELETE FROM `" + req.params.table + "` WHERE " + req.params.col + "='" + req.params.id + "'";
        if (req.params.table == "sinh_vien" | req.params.table == "giao_vien") {
            sql = "DELETE `tai_khoan`,`" + req.params.table + "` FROM `tai_khoan`,`" + req.params.table + "` WHERE tai_khoan.id = " +
                req.params.table + ".ma_tai_khoan AND " + req.params.table + ".id = '" + req.params.id + "'";
        }
        if (req.params.table == "mon_hoc") {

        }
        console.log(sql)
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(true);
        })
    },

    student: (req, res) => {
        var sql = "SELECT sinh_vien.*,lop.ten_lop FROM `sinh_vien`,`lop` WHERE sinh_vien.ma_lop=lop.id";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            connection.query("SELECT * FROM `lop`", (err, classes) => {
                if (err) throw err;
                res.render('page/student', {
                    title: 'Student',
                    user: res.locals.user,
                    students: rows,
                    classes: classes,
                })
            })
        })

    },

    update_student: (req, res) => {
        var student = {
            msv: req.body.msv,
            ten: req.body.ten,
            ngay_sinh: req.body.ngay_sinh,
            gioi_tinh: req.body.gt,
            email: req.body.email,
            sdt: req.body.sdt,
            dia_chi: req.body.dia_chi,
            ma_lop: req.body.ma_lop,
        }
        var sql = "UPDATE sinh_vien SET ? WHERE id =" + req.body.edit;
        connection.query(sql, student, (error, results, fields) => {
            if (error) throw error;
            var sql_account = "UPDATE `tai_khoan` SET `ten_tai_khoan`='" + student.email + "' WHERE `ten_tai_khoan`='" + req.body.email_old + "'";
            connection.query(sql_account, (err, rows) => {
                if (error) throw error;
                if (req.body.path != null) {
                    res.redirect(req.body.path);
                    return;
                }
                res.redirect("/admin/student");
            })

        })
    },

    insert_student: (req, res) => {
        var sql_account = "INSERT INTO `tai_khoan`(`ten_tai_khoan`, `mat_khau`, `vai_tro`) VALUES ('" + req.body.email + "','123','1')";
        connection.query(sql_account, (err, rows) => {
            if (err) throw err;
            var sql = "INSERT INTO `sinh_vien`(`msv`, `ten`, `ngay_sinh`, `gioi_tinh`, `email`, `sdt`, `dia_chi`, `ma_lop`, `ma_tai_khoan`) VALUES (?,?,?,?,?,?,?,?,?)";
            var student = [
                req.body.msv,
                req.body.ten,
                req.body.ngay_sinh,
                req.body.gt,
                req.body.email,
                req.body.sdt,
                req.body.dia_chi,
                req.body.ma_lop,
                rows.insertId
            ];
            connection.query(sql, student, (err, result) => {
                if (err) throw err;
                res.redirect("/admin/student");
            })
        })
    },

    teacher: (req, res) => {
        var sql = "SELECT * FROM `giao_vien`";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('page/teacher', {
                title: 'Teacher',
                user: res.locals.user,
                teachers: rows,
            })
        })
    },

    insert_teacher: (req, res) => {
        var sql_account = "INSERT INTO `tai_khoan`(`ten_tai_khoan`, `mat_khau`, `vai_tro`) VALUES ('" + req.body.email + "','123','0')";
        connection.query(sql_account, (err, rows) => {
            if (err) throw err;
            var sql = "INSERT INTO `giao_vien`(`mgv`, `ten`, `sdt`, `email`, `ma_tai_khoan` , `khoa`) VALUES (?,?,?,?,?,?)";
            var teacher = [
                req.body.mgv,
                req.body.ten,
                req.body.sdt,
                req.body.email,
                rows.insertId,
                req.body.khoa
            ];
            connection.query(sql, teacher, (err, result) => {
                if (err) throw err;
                res.redirect("/admin/teacher");
            })
        })
    },

    update_teacher: (req, res) => {
        var teacher = {
            mgv: req.body.mgv,
            ten: req.body.ten,
            sdt: req.body.sdt,
            email: req.body.email,
            khoa: req.body.khoa
        }
        var sql = "UPDATE giao_vien SET ? WHERE id =" + req.body.edit;
        connection.query(sql, teacher, (error, results, fields) => {
            if (error) throw error;
            var sql_account = "UPDATE `tai_khoan` SET `ten_tai_khoan`='" + teacher.email + "' WHERE `ten_tai_khoan`='" + req.body.email_old + "'";
            connection.query(sql_account, (err, rows) => {
                if (error) throw error;
                res.redirect("/admin/teacher");
            })

        })
    },

    subject: (req, res) => {
        var sql = "SELECT * FROM `mon_hoc`, `nam_hoc` WHERE mon_hoc.ma_hoc_ky = nam_hoc.ma_hoc_ky";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var sql = "SELECT * FROM `nam_hoc`";
            connection.query(sql, (err, nam_hoc) => {
                if (err) throw err;
                res.render('page/subject', {
                    title: 'Subject',
                    user: res.locals.user,
                    subjects: rows,
                    nam_hoc: nam_hoc
                })
            })
        })
    },

    update_subject: (req, res) => {
        var sql = "UPDATE mon_hoc SET ? WHERE id =" + req.body.id;
        connection.query(sql, req.body, (error, results, fields) => {
            if (error) throw error;
            res.redirect("/admin/subject");
        })
    },

    insert_subject: (req, res) => {
        var sql_account = "INSERT INTO `mon_hoc`(`ma_mon_hoc`, `ten_mon_hoc`, `bat_dau`, `ket_thuc`, `tong_tuan`, `so_tiet`, `ma_hoc_ky`) VALUES (?,?,?,?,?,?,?)";

        var Subject = [
            req.body.ma_mon_hoc,
            req.body.ten_mon_hoc,
            req.body.bat_dau,
            req.body.ket_thuc,
            req.body.tong_tuan,
            req.body.so_tiet,
            req.body.ma_hoc_ky,
        ];
        connection.query(sql_account, Subject, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/subject");
        })
    },

    lop_hoc_phan: (req, res) => {
        var sql = "SELECT `lop_hoc_phan`.*, giao_vien.*, lop.*, mon_hoc.* FROM `lop`, `lop_hoc_phan`, `giao_vien`, `mon_hoc` WHERE lop_hoc_phan.ma_lop = lop.id AND lop_hoc_phan.mgv = giao_vien.mgv AND mon_hoc.ma_mon_hoc = lop_hoc_phan.ma_mon_hoc";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            var sql = "SELECT * FROM `mon_hoc`";
            connection.query(sql, (err, subject) => {
                if (err) throw err;
                var sql = "SELECT * FROM `lop`"
                connection.query(sql, (err, lop) => {
                    if (err) throw err;
                    var sql = "SELECT * FROM `giao_vien`"
                    connection.query(sql, (err, giao_vien) => {
                        if (err) throw err;
                        var st = 0;
                        for (var i = 0; i < rows.length; i++) {
                            st = (st + rows[i].so_tiethp);
                        }
                        res.render('page/classStudy', {
                            title: 'Modules',
                            user: res.locals.user,
                            classStudies: rows,
                            subjects: subject,
                            lop: lop,
                            gv: giao_vien,
                            total_st: st
                        })
                        console.log(rows)
                    })
                })
            })
        })
    },

    add_lop_hp: (req, res) => {
        var lop_hoc_phan = [
            req.body.ma_lop_hp,
            req.body.ten_lop_hp,
            req.body.mon_hoc,
            req.body.lop,
            req.body.giao_vien
        ];
        console.log(lop_hoc_phan);
        var sql = "INSERT INTO `lop_hoc_phan`(`ma_lop_hp`, `ten_lop_hp`, `ma_mon_hoc`, `ma_lop`, `mgv`) VALUES (?,?,?,?,?)";
        connection.query(sql, lop_hoc_phan, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/modules");
        })
    },

    update_lop_hp: (req, res) => {
        var sql = "UPDATE lop_hoc_phan SET ? WHERE idlhp = " + req.body.idlhp;
        connection.query(sql, req.body, (error, results, fields) => {
            if (error) throw error;
            res.redirect("/admin/modules");
            console.log(sql);
        })
    },

    show_lop_hp: (req, res) => {
        var sql = "SELECT ct_lop_hp.*,sinh_vien.ten,lop.ten_lop FROM `lop_hoc_phan`,`ct_lop_hp`,`sinh_vien`,`lop` " +
            "WHERE lop_hoc_phan.ma_lop_hp = ct_lop_hp.ma_lop_hp AND ct_lop_hp.ma_sinh_vien = sinh_vien.msv AND sinh_vien.ma_lop = lop.id AND ct_lop_hp.ma_lop_hp='" + req.params.lop + "'";
        connection.query(sql, (error, results) => {
            if (error) throw error;
            var sql_lhp = "SELECT * FROM `lop_hoc_phan` where ma_lop_hp='" + req.params.lop + "'";
            connection.query(sql_lhp, (err, rows) => {
                if (err) throw err;
                var sql_allclass = "SELECT * FROM `lop_hoc_phan` where ma_mon_hoc='" + rows[0].ma_mon_hoc + "'";
                connection.query(sql_allclass, (err, lhp) => {
                    if (err) throw err;
                    res.render('page/listStudentmodules', {
                        title: 'Module | ' + rows[0].ten_lop_hp,
                        user: res.locals.user,
                        liststudent: results,
                        lop_hp: rows,
                        list_lhp: lhp
                    })
                })
            })
        })
    },

    calendar: (req, res) => {
        var search = req.body.search_tuan;
        var sql = "SELECT * FROM `giao_vien` AS gv,`lich_hoc` as lh," +
            "`lop_hoc_phan` as lhp,`phong_hoc`,`lop`,`nam_hoc`,`mon_hoc` where mon_hoc.ma_mon_hoc = lhp.ma_mon_hoc" +
            " AND phong_hoc.ma_phong=lh.ma_phong AND nam_hoc.`ma_hoc_ky`=mon_hoc.`ma_hoc_ky` " +
            "AND lh.`ma_lop_hp` = lhp.`ma_lop_hp` AND lh.mgv = gv.mgv AND lh.ma_lop = lop.id ORDER BY lh.`tuan_thu`,lh.`thoi_gian` DESC;";
        connection.query(sql, (err, rows) => {
            var myRRow = rows.map(a => {
                const now = new Date(a.bat_daunh);
                const i = dates.indexOf(a.thoi_gian);
                const w = a.tuan_thu;
                now.setDate(now.getDate() - now.getDay() + i + 1 + w * 7);
                var ngay = (Number(now.getDate()) <= 9) ? "0" + now.getDate() : now.getDate();
                var thang = (Number(now.getMonth() + 1) <= 9) ? now.getMonth() + 1 : now.getMonth() + 1;
                a.tenGiCungDc = dateNames[i] + `<br> (${ngay}/${thang}/${now.getFullYear()})`;
                a.date = new Date(now);
                return a;
            }).sort((a, b) => {
                return (new Date(b.date) - new Date(a.date)) * (-1);
            });
            if (err) throw err;
            var sql_mh = "SELECT * FROM `mon_hoc`"
            connection.query(sql_mh, (err, mon_hoc) => {
                if (err) throw err;
                var listDate = [
                    ['T2', 'Thứ Hai'],
                    ['T3', 'Thứ Ba'],
                    ['T4', 'Thứ Tư'],
                    ['T5', 'Thứ Năm'],
                    ['T6', 'Thứ Sáu'],
                    ['T7', 'Thứ Bảy'],
                    ['CN', 'Chủ Nhật'],
                ];
                var sql = "SELECT * FROM `phong_hoc`";
                connection.query(sql, (err, phong) => {
                    if (err) throw err;
                    var sql = "SELECT * FROM `lop`";
                    connection.query(sql, (err, lop) => {
                        if (err) throw err;
                        res.render('page/calendar', {
                            title: 'Calendar',
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

    select_col: (req, res) => {
        var sql = "SELECT * FROM `" + req.params.table + "` WHERE " + req.params.col + "='" + req.params.val + "'";
        console.log(sql);
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.send(rows);
        })
    },

    calendar_add: (req, res) => {
        var sql = "INSERT INTO `lich_hoc`(`tiet_hoc`, `buoi_hoc`,`thoi_gian`, `ma_phong`, `ma_lop_hp`, `mgv`, `ma_lop`, `tuan_thu`) VALUES (?,?,?,?,?,?,?,?)";
        console.log(sql);
        var calendar = [
            req.body.bat_dau + "->" + req.body.ket_thuc,
            req.body.buoi_hoc,
            req.body.thuadd,
            req.body.phong,
            req.body.lop_hp,
            req.body.giao_vien,
            req.body.lop,
            req.body.tuan_thu,
        ];

        var sqlCheck = "SELECT * FROM `lich_hoc` WHERE (`ma_lop_hp`= '" + req.body.lop_hp + "'  AND `tiet_hoc` = '" + req.body.bat_dau +
            "->" + req.body.ket_thuc + "' AND `thoi_gian`='" + req.body.thuadd +
            "' AND `buoi_hoc`='" + req.body.buoi_hoc + "' AND `ma_phong`= '" + req.body.phong + "' AND `mgv`= '" + req.body.giao_vien + "' ) " +
            "OR (`tiet_hoc` LIKE '%" + req.body.bat_dau + "%' AND `thoi_gian`='" + req.body.thuadd +
            "' AND `buoi_hoc`='" + req.body.buoi_hoc + "' AND `ma_phong`= '" + req.body.phong + "')"
        console.log(sqlCheck)
        connection.query(sqlCheck, (err, rows) => {
            if (err) throw err;
            if (rows.length == 0) {
                connection.query(sql, calendar, (err, result) => {
                    if (err) throw err;
                    res.cookie('notification', "Thêm Lịch Thành Công", {
                        signed: true
                    });
                    res.redirect("/admin/calendar");
                })
            } else {
                res.cookie('notification', "Lịch Tồn Tại", {
                    signed: true
                });
                res.redirect("/admin/calendar");
            }

        })
    },

    calendar_edit: (req, res) => {
        console.log(req.body);
        var sql = "UPDATE lich_hoc SET ? WHERE ma_lich =" + req.body.id;
        var calendar = {
            tiet_hoc: req.body.bat_dau + "->" + req.body.ket_thuc,
            buoi_hoc: req.body.buoi_hoc,
            thoi_gian: req.body.thu,
            ma_phong: req.body.phong,
            ma_lop_hp: req.body.lop_hp,
            mgv: req.body.giao_vien,
            ma_lop: req.body.lop,
        };
        var sqlCheck = "SELECT * FROM `lich_hoc` WHERE (`ma_lop_hp`= '" + req.body.lop_hp +
            "'  AND `thoi_gian`='" +
            req.body.thu + "' AND `buoi_hoc`='" + req.body.buoi_hoc +
            "' AND `ma_phong`= '" + req.body.phong + "' AND `mgv`= '" + req.body.giao_vien + "' )" +

            " OR ( `tiet_hoc` = '" + req.body.bat_dau +
            "->" + req.body.ket_thuc + "' AND `thoi_gian`='" +
            req.body.thu + "' AND `buoi_hoc`='" + req.body.buoi_hoc +
            "' AND `ma_phong`= '" + req.body.phong + "' AND `mgv`= '" + req.body.giao_vien + "' )"
        connection.query(sqlCheck, (err, rows) => {
            if (err) throw err;
            console.log(sqlCheck)
            console.log(rows.length)
            if (rows.length == 0) {
                connection.query(sql, calendar, (err, result) => {
                    if (err) throw err;
                    res.cookie('notification', "Sửa Lịch Thành Công", {
                        signed: true
                    });
                    res.redirect("/admin/calendar");
                })
            } else {
                res.cookie('notification', "Lịch Tồn Tại", {
                    signed: true
                });
                res.redirect("/admin/calendar");
            }

        })
    },

    exportExcel: (req, res) => {
        var sql = "SELECT `lop_hoc_phan`.*,`mon_hoc`.`ten_mon_hoc` FROM  `lop_hoc_phan`,`mon_hoc` where mon_hoc.`ma_mon_hoc` = lop_hoc_phan.`ma_mon_hoc`";
        connection.query(sql, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/admin/modules");
        })
    },

    term: (req, res) => {
        var sql = "SELECT * FROM `nam_hoc`";
        connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('page/term', {
                title: 'Term',
                user: res.locals.user,
                term: rows,
            })
        })
    },

    term_add: (req, res) => {
        var sql_termadd = "INSERT INTO `nam_hoc`( `ma_hoc_ky`, `hoc_ky`, `bat_daunh`, `ket_thucnh`) VALUES (?,?,?,?)";
        console.log(req.body);
        var Subject = [
            req.body.ma_hoc_ky,
            req.body.hoc_ky,
            req.body.bat_daunh,
            req.body.ket_thucnh
        ];
        connection.query(sql_termadd, Subject, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin/term");
        })
    },

    term_update: (req, res) => {
        var sql = "UPDATE nam_hoc SET ? WHERE idhk =" + req.body.idhk;
        connection.query(sql, req.body, (error, results, fields) => {
            if (error) throw error;
            res.redirect("/admin/term");
        })
    },
}