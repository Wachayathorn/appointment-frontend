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

function RequestAppointmentTeacher(i) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var count = 0;
                var name = getCookie('User');
                var role = getCookie('Role');
                if (i == null) {
                    document.getElementById("user_login").innerHTML = name;
                }
                if (name != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestProcess",
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
    // Draw barcode
    var bar_id = "bar_" + count;
    var _BARCODE = doc.barcode;
    table.row.add([count, doc.topic, doc.name, '<img class="table-image" src="/assets/images/process.png" style="width : 45px; height:45px;">', '<svg id="' + bar_id + '" class="barcode"></svg>', doc.note_ID, doc.student_ID, doc.teacher, doc.date, doc.time, doc.detail, doc.status, doc.day, doc.barcode, doc.section, doc.advisorName]).draw();

    $("#" + bar_id).JsBarcode(_BARCODE, { format: "CODE128" });
}

function rowChild(obj) {
    return '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + '<b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>กลุ่ม : </b>' + obj["Section"] + '<b style="margin-left:10px;">อาจารย์ที่ปรึกษา : </b>' + obj["Advisor"] + '</p>' + '<p><b>นัดหมาย : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + '</p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>' + '<p><b>เลขบาร์โค้ด : </b>' + obj["Barcode"] + '</p>' + '<button type="button" class="btn btn-orange" value="' + obj["Note_ID"] + '"  onclick="sendSpecificallyNotification(this.value)">ส่งแจ้งเตือนนักศึกษา</button>';
}

function submitSendNotification() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var barcode_id = document.getElementById('tb_barcode_id').value;
        if (barcode_id.trim() != "") {
            $('#md_send_noti').modal('toggle');
            blockUI();
            var today = new Date();
            var finished_date = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
            var finished_date_millis = today.getTime();
            var role = getCookie('Role');

            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/processFinished",
                type: "POST",
                data: {
                    'role': role,
                    'type': "2",
                    'date': finished_date,
                    'dateMillis': finished_date_millis,
                    'barcode_id': barcode_id,
                },
                success: function (data) {
                    if (data === "Process document success") {
                        unBlockUI();
                        Swal.fire({
                            type: 'success',
                            title: 'SUCCESS',
                            text: 'ส่งการแจ้งเตือนถึงนักศึกษาสำเร็จ',
                            confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                        }).then(function () {
                            document.getElementById('tb_barcode_id').value = "";
                            table.clear().draw();
                            RequestAppointmentTeacher(i = 1);
                            $('#md_send_noti').modal();
                        })
                    } else if (data === "No barcode id") {
                        unBlockUI();
                        Swal.fire({
                            type: 'error',
                            title: 'ERROR',
                            text: 'หมายเลขบาร์โค้ดนี้ยังไม่ได้ถูกใช้งาน !',
                            confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                        }).then(function () {
                            $('#md_send_noti').modal();
                            document.getElementById('tb_barcode_id').value = "";
                        })
                    } else {
                        unBlockUI();
                        Swal.fire({
                            type: 'error',
                            title: 'ERROR',
                            text: 'Error !',
                            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                        }).then(function () {
                            $('#md_send_noti').modal();
                            document.getElementById('tb_barcode_id').value = "";
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
            location.reload();
        }
    }
}

function sendSpecificallyNotification(docID) {
    blockUI();
    var today = new Date();
    var finished_date = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
    var finished_date_millis = today.getTime();
    var role = getCookie('Role');
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/processFinished",
        type: "POST",
        data: {
            'note_id': docID,
            'role': role,
            'type': "1",
            'date': finished_date,
            'dateMillis': finished_date_millis,
        },
        success: function (data) {
            if (data) {
                unBlockUI();
                Swal.fire({
                    type: 'success',
                    title: 'SUCCESS',
                    text: 'ส่งการแจ้งเตือนถึงนักศึกษาสำเร็จ',
                    confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                }).then(function () {
                    table.clear().draw();
                    RequestAppointmentTeacher(i = 1);
                })
            } else {
                unBlockUI();
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

function blockUI() {
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
};

function unBlockUI() {
    $.unblockUI();
}