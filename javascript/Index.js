var functionIsRunning = false;
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

function ManageCookie() {
    document.cookie = "User=; expires=Thu, 01 Jan 1970 00:00:00";
    document.cookie = "Role=; expires=Thu, 01 Jan 1970 00:00:00";
    document.cookie = "uID=; expires=Thu, 01 Jan 1970 00:00:00";

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user != null) {
                if (!functionIsRunning) {
                    blockUI();
                }
                var currentEmail = firebase.auth().currentUser.email;
                var numofadd = currentEmail.indexOf("@");
                var username = currentEmail.substring(0, numofadd);

                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/login",
                    type: "POST",
                    data: {
                        'username': username,
                    },
                    success: function (data) {
                        var data = Object.values(data)[0];
                        setCookie("User", data.Name_prefix + data.Name.toString(), 1);
                        setCookie("Role", data.Role.toString(), 1);
                        setCookie("uID", data.uID.toString(), 1);
                        setTimeout(function () {
                            switch (data.Role) {
                                case "แอดมิน": unBlockUI(); window.location.href = "/pages/Admin_Home.html"; break;
                                case "อาจารย์": unBlockUI(); window.location.href = "/pages/Teacher_Dashboard.html"; break;
                                case "ฝ่ายธุรการ": unBlockUI(); window.location.href = "/pages/Manage_Dashboard.html"; break;
                                case "ฝ่ายบริการ": unBlockUI(); window.location.href = "/pages/Service_Dashboard.html"; break;
                            }
                        }, 1500);
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
            }
        }
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function submitLogin() {
    blockUI();
    var username = document.getElementById('tb_username').value.toString().trim();
    var password = document.getElementById('tb_password').value.toString().trim();

    if (username == "") {
        unBlockUI();
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาใส่ชื่อผู้ใช้',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else if (password == "") {
        unBlockUI();
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาใส่รหัสผ่าน',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else {
        var userlower = username.toLocaleLowerCase();
        var user = userlower + "@cpe.ac.th";

        firebase.auth().signInWithEmailAndPassword(user, password).catch(function (err) {
        }).then(function () {
            var user = firebase.auth().currentUser;
            if (user != null) {
                console.log("Login success");
            } else {
                unBlockUI();
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                })
            }
        })

    }
};

function blockUI() {
    functionIsRunning = true;
    $.blockUI({
        css: {
            border: 'none',
            backgroundColor: 'transparent',
            color: '#000000',
            center: true,
        },
        overlayCSS: {
            backgroundColor: '#FFFFFF',
        },
        message: $('#loading_scn')
    });
}

function unBlockUI() {
    functionIsRunning = false;
    $.unblockUI();
}