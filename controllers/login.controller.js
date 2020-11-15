var connection = require('../connection.js');

module.exports = {
    login: (req, res) => {
        res.render('login/index', {
            title: 'Login',
        })
    },

    login_post: async (req, res) => {
        var username = req.body.username;
        var password = req.body.password;

        if (username === "admin" && password === "123") {
            res.cookie('user', username, {
                signed: true
            });
            res.redirect('/admin')
        } else {
            var sql = "SELECT * FROM `tai_khoan` WHERE ten_tai_khoan='"+username+"' AND mat_khau='"+password+"' AND vai_tro="+0;
            var error = "Tài Khoản Không Tồn Tại";
            connection.query(sql, (err, rows) => {
                if (err) throw err;
                if (rows.length === 0) {
                    res.render('login/index', {
                        title: 'Login',
                        error: error,
                    });
                } else {
                    res.cookie('user', username, {
                        signed: true
                    });
                    res.redirect('/')
                }
            })
        }
    },

    logout: (req, res) => {
        res.clearCookie("user");
        res.redirect("/")
    },
}