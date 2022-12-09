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
                // User is signed in.
                if (name != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestAccept",
                        type: "POST",
                        data: {
                            'nameUser': name,
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
    table.row.add([count, doc.topic, doc.name, '<img class="table-image" src="/assets/images/accept.png" style="width : 45px; height:45px;">', doc.date, doc.note_ID, doc.student_ID, doc.teacher, doc.date, doc.time, doc.detail, doc.status, doc.day, doc.section, doc.advisorName]).draw();
}

function rowChild(obj) {
    return '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + '<b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>กลุ่ม : </b>' + obj["Section"] + '<b style="margin-left:10px;">อาจารย์ที่ปรึกษา : </b>' + obj["Advisor"] + '</p>' + '<p><b>นัดหมาย : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + '</p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>' + '<button type="button" class="btn btn-orange" value="' + obj["Note_ID"] + '"  onclick="addBarcode(this.value)">จัดคิวดำเนินเอกสาร</button>';
}
var currentNote;
function addBarcode(note) {
    currentNote = "";
    currentNote = note;
    $('#md_processdoc').modal();
}

function processDocument() {
    $('#md_processdoc').modal('hide');
    blockUI();
    if (currentNote) {
        var barcode = document.getElementById('tb_barcode').value.toString().trim();
        var role = getCookie('Role');
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/process",
            type: "POST",
            data: {
                'role': role,
                'note_id': currentNote,
                'barcode': barcode,
            },
            success: function (data) {
                if (data === "OK") {
                    unBlockUI();
                    Swal.fire({
                        type: 'success',
                        title: 'SUCCESS',
                        text: 'จัดคิวดำเนินเอกสารสำเร็จ',
                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                    }).then(function () {
                        document.getElementById('tb_barcode').value = "";
                        table.clear().draw();
                        RequestAppointmentTeacher(i = 1);
                    })
                } else if (data === "No barcode id") {
                    unBlockUI();
                    Swal.fire({
                        type: 'error',
                        title: 'ERROR',
                        text: 'ไม่มีหมายเลขบาร์โค้ดนี้ในระบบ !',
                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                    }).then(function () {
                        $('#md_processdoc').modal();
                        document.getElementById('tb_barcode').value = "";
                    })
                } else if (data === "Using") {
                    unBlockUI();
                    Swal.fire({
                        type: 'error',
                        title: 'ERROR',
                        text: 'หมายเลขบาร์โค้ดนี้กำลังใช้งานอยู่ ! กรุณาเปลี่ยนใหม่',
                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                    }).then(function () {
                        $('#md_processdoc').modal();
                        document.getElementById('tb_barcode').value = "";
                    })
                } else {
                    unBlockUI();
                    Swal.fire({
                        type: 'error',
                        title: 'ERROR',
                        text: 'Error !',
                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                    }).then(function () {
                        $('#md_processdoc').modal();
                        document.getElementById('tb_barcode').value = "";
                    })
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            },
        });
    } else {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'Error barcode id !',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        }).then(function () {
            $('#md_processdoc').modal();
            unBlockUI();
        })
    }
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