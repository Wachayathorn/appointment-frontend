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

var acceptApp = 0;
var declineApp = 0;
var allApp = 0;
var processDoc = 0;

function RequestCountAppointment() {
    var timeToday = moment().format("DD/MM/YYYY");
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var name = getCookie('User');
                var role = getCookie('Role');
                document.getElementById("user_login").innerHTML = name;
                // ยิง API
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/dash",
                    type: "POST",
                    data: {
                        'time': timeToday,
                        'role': role,
                    },
                    success: function (data) {
                        if (data) {
                            if (data.allApp == 0) {
                                $('#dash_all_app').html(0);
                                $('#dash_accept_value').html(0);
                                $('#dash_decline_value').html(0);
                                $('#dash_proDoc_value').html(0);
                                runNumberDashboard();
                                noAppInToday();
                                document.getElementById("listcount").innerHTML = 0;
                            } else {
                                $('#dash_all_app').html(data.allApp);
                                $('#dash_accept_value').html(data.allAccept);
                                $('#dash_decline_value').html(data.allDecline);
                                $('#dash_proDoc_value').html(data.allProcess);
                                runNumberDashboard();
                                var dataApp = data.allAppData;
                                for (var i = 0; i < dataApp.length; i++) {
                                    if (i < 5) {
                                        document.getElementById("listcount").innerHTML = i + 1;
                                        initListgroup(dataApp[i]);
                                    }
                                }
                            }
                        } else {
                            Swal.fire({
                                type: 'error',
                                title: 'ERROR',
                                text: 'Error !',
                                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                            }).then(function () {
                                RequestCountAppointment();
                            })
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
            }
        } else {
            // No user is signed in.
            console.log("No user signed in");
            var name = getCookie('User');
            if (!name) {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'กรุณาเข้าสู่ระบบก่อนใช้งาน !',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                }).then(function () {
                    window.location.href = "/index.html";
                })
            } else {
                window.location.href = "/index.html";
            }
        }
    });
};

function runNumberDashboard() {
    $(".dash_value").fadeIn(500);
    $('.counter-count').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 1500,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}

function initListgroup(doc) {
    var listgroup = '';
    if (doc.status == "อนุมัติ" || doc.status == "อนุมัติ(เสร็จสิ้น)") {
        listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" id="' + doc.note_ID + '">' +
            '<div class="d-flex w-100 justify-content-between">' +
            '<h4 class="mb-1" style="margin-top: 5px;"><b>นักศึกษาชื่อ : </b>' + doc.name + '</h4>' +
            '<small><img src="/assets/images/accept.png"style="width: 45px; height: 45px;"></small>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<div class="row mb-0" style="margin: 0px; vertical-align: middle;">' +
            '<p><b>หัวข้อการนัดหมาย : </b>' + doc.topic + '</p>' +
            '<p style="margin-left: 30px;"><b>วัน : </b>' + doc.day + '</p>' +
            '<p style="margin-left: 5px;"><b>ที่ : </b>' + doc.date + '</p>' +
            '<p style="margin-left: 5px;"><b>เวลา : </b>' + doc.time + '</p>' +
            '<p style="margin-left: 30px;"><b>สถานะการนัดหมาย : </b><span style="font-weight: bold; color: #2dee47;">อนุมัติ</span></p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else if (doc.status == "ปฏิเสธ" || doc.status == "ปฏิเสธ(เสร็จสิ้น)") {
        listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" id="' + doc.note_ID + '">' +
            '<div class="d-flex w-100 justify-content-between">' +
            '<h4 class="mb-1" style="margin-top: 5px;"><b>นักศึกษาชื่อ : </b>' + doc.name + '</h4>' +
            '<small><img src="/assets/images/decline.png"style="width: 45px; height: 45px;"></small>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<div class="row mb-0" style="margin: 0px; vertical-align: middle;">' +
            '<p><b>หัวข้อการนัดหมาย : </b>' + doc.topic + '</p>' +
            '<p style="margin-left: 30px;"><b>วัน : </b>' + doc.day + '</p>' +
            '<p style="margin-left: 5px;"><b>ที่ : </b>' + doc.date + '</p>' +
            '<p style="margin-left: 5px;"><b>เวลา : </b>' + doc.time + '</p>' +
            '<p style="margin-left: 30px;"><b>สถานะการนัดหมาย : </b><span style="font-weight: bold; color: #f26363;">ปฏิเสธ</span></p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else if (doc.status == "รอการตอบรับ") {
        listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" id="' + doc.note_ID + '">' +
            '<div class="d-flex w-100 justify-content-between">' +
            '<h4 class="mb-1" style="margin-top: 5px;"><b>นักศึกษาชื่อ : </b>' + doc.name + '</h4>' +
            '<small><img src="/assets/images/wait.png"style="width: 45px; height: 45px;"></small>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<div class="row mb-0" style="margin: 0px; vertical-align: middle;">' +
            '<p><b>หัวข้อการนัดหมาย : </b>' + doc.topic + '</p>' +
            '<p style="margin-left: 30px;"><b>วัน : </b>' + doc.day + '</p>' +
            '<p style="margin-left: 5px;"><b>ที่ : </b>' + doc.date + '</p>' +
            '<p style="margin-left: 5px;"><b>เวลา : </b>' + doc.time + '</p>' +
            '<p style="margin-left: 30px;"><b>สถานะการนัดหมาย : </b><span style="font-weight: bold; color: #f2db24;">รอการตอบรับ</span></p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else if (doc.status == "ไม่มีการตอบรับ") {
        listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" id="' + doc.note_ID + '">' +
            '<div class="d-flex w-100 justify-content-between">' +
            '<h4 class="mb-1" style="margin-top: 5px;"><b>นักศึกษาชื่อ : </b>' + doc.name + '</h4>' +
            '<small><img src="/assets/images/no_answer.png"style="width: 45px; height: 45px;"></small>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<div class="row mb-0" style="margin: 0px; vertical-align: middle;">' +
            '<p><b>หัวข้อการนัดหมาย : </b>' + doc.topic + '</p>' +
            '<p style="margin-left: 30px;"><b>วัน : </b>' + doc.day + '</p>' +
            '<p style="margin-left: 5px;"><b>ที่ : </b>' + doc.date + '</p>' +
            '<p style="margin-left: 5px;"><b>เวลา : </b>' + doc.time + '</p>' +
            '<p style="margin-left: 30px;"><b>สถานะการนัดหมาย : </b><span style="font-weight: bold; color: #f26363;">ไม่มีการตอบรับ</span></p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else if (doc.status == "กำลังดำเนินเอกสาร") {
        listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" id="' + doc.note_ID + '">' +
            '<div class="d-flex w-100 justify-content-between">' +
            '<h4 class="mb-1" style="margin-top: 5px;"><b>นักศึกษาชื่อ : </b>' + doc.name + '</h4>' +
            '<small><img src="/assets/images/process.png"style="width: 45px; height: 45px;"></small>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<div class="row mb-0" style="margin: 0px; vertical-align: middle;">' +
            '<p><b>หัวข้อการนัดหมาย : </b>' + doc.topic + '</p>' +
            '<p style="margin-left: 30px;"><b>วัน : </b>' + doc.day + '</p>' +
            '<p style="margin-left: 5px;"><b>ที่ : </b>' + doc.date + '</p>' +
            '<p style="margin-left: 5px;"><b>เวลา : </b>' + doc.time + '</p>' +
            '<p style="margin-left: 30px;"><b>สถานะการนัดหมาย : </b><span style="font-weight: bold; color: #ffea83;">กำลังดำเนินเอกสาร</span></p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else if (doc.status == "ดำเนินเอกสารเสร็จสิ้น") {
        listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" id="' + doc.note_ID + '">' +
            '<div class="d-flex w-100 justify-content-between">' +
            '<h4 class="mb-1" style="margin-top: 5px;"><b>นักศึกษาชื่อ : </b>' + doc.name + '</h4>' +
            '<small><img src="/assets/images/doc_complete.png"style="width: 45px; height: 45px;"></small>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<div class="row mb-0" style="margin: 0px; vertical-align: middle;">' +
            '<p><b>หัวข้อการนัดหมาย : </b>' + doc.topic + '</p>' +
            '<p style="margin-left: 30px;"><b>วัน : </b>' + doc.day + '</p>' +
            '<p style="margin-left: 5px;"><b>ที่ : </b>' + doc.date + '</p>' +
            '<p style="margin-left: 5px;"><b>เวลา : </b>' + doc.time + '</p>' +
            '<p style="margin-left: 30px;"><b>สถานะการนัดหมาย : </b><span style="font-weight: bold; color: #8ed5ff;">ดำเนินเอกสารเสร็จสิ้น</span></p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    $('#dashboard_listgroup').append(listgroup);
}

function noAppInToday() {
    var listgroup = '<div class="list-group-item list-group-item-action flex-column align-items-start" style="border: 0px;">' +
        '<div class="d-flex w-100 justify-content-center">' +
        '<h3 class="mb-1"><i>ไม่มีการนัดหมายในวันนี้</i></h3>' +
        '</div>' +
        '</div>';
    $('#dashboard_listgroup').append(listgroup);
}