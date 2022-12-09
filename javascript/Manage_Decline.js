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

function RequestAppointmentTeacher() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var count = 0;
                var name = getCookie('User');
                var role = getCookie('Role');
                document.getElementById("user_login").innerHTML = name;
                // User is signed in.
                if (name != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestDecline",
                        type: "POST",
                        data: {
                            'role': role,
                        },
                        success: function (data) {
                            if (data) {
                                if (data.allAppData) {
                                    var allAppointment = data.allAppData;
                                    for (i = 0; i < allAppointment.length; i++) {
                                        count++;
                                        initDatatable(allAppointment[i], count);
                                    }
                                }
                            } else {
                                Swal.fire({
                                    type: 'error',
                                    title: 'ERROR',
                                    text: 'Error !',
                                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                                }).then(function () {
                                    RequestAppointmentTeacher();
                                })
                            }
                        },
                        error: function (xhr, status, error) {
                            console.log('Error: ' + error.message);
                        },
                    });
                }
                else {
                    console.log("User is null");
                }
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
}

function initDatatable(doc, count) {
    table.row.add([count, doc.topic, doc.name, '<img class="table-image" src="/assets/images/decline.png" style="width : 45px; height:45px;">', doc.date, doc.note_ID, doc.student_ID, doc.teacher, doc.date, doc.time, doc.detail, doc.status, doc.day, doc.declineReason, doc.section, doc.advisorName]).draw();
}

function rowChild(obj) {
    return '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + '<b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>กลุ่ม : </b>' + obj["Section"] + '<b style="margin-left:10px;">อาจารย์ที่ปรึกษา : </b>' + obj["Advisor"] + '</p>' + '<p><b>นัดหมาย : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + ' <b style="margin-left:10px;">เหตุผลที่ปฏิเสธ : </b> ' + obj["DeclineReason"] + '</p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>';
}