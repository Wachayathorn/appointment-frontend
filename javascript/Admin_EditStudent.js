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

var _allSectionID = [];
var _allSectionName = [];

function checkAuth() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
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
        } else {
            // blockUI();
            var roleAdmin = getCookie('Role');
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestAllSection",
                type: "POST",
                data: {
                    'roleAdmin': roleAdmin,
                },
                success: function (data) {
                    // unBlockUI();
                    if (data.id) {
                        _allSectionID = data.id;
                        _allSectionName = data.section;
                    }
                },
                error: function (xhr, status, error) {
                    console.log('Error: ' + error.message);
                },
            });
        }
    });
}

function submitSearch() {
    // Clear value input
    document.getElementById('tb_name_show').value = "";
    document.getElementById('tb_id_show').value = "";
    document.getElementById('tb_section_show').value = "";
    document.getElementById('tb_advisor_show').value = "";
    document.getElementById('tb_username_show').value = "";
    table.clear().draw();

    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        blockUI();
        var student_id = document.getElementById('search_student_id').value.toString();
        if (student_id == "") {
            unBlockUI();
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่รหัสนักศึกษาที่ต้องการค้นหา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            var roleAdmin = getCookie('Role');
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/searchUser",
                type: "POST",
                data: {
                    'roleAdmin': roleAdmin,
                    'name': student_id,
                    'type': "2"
                },
                success: function (data) {
                    if (data) {
                        var index = _allSectionID.indexOf(data["Section_ID"]);
                        document.getElementById('tb_name_show').value = data["Name"];
                        document.getElementById('tb_id_show').value = data["Student_ID"];
                        document.getElementById('tb_advisor_show').value = data["AdvisorName"];
                        document.getElementById('tb_username_show').value = data["Username"];
                        document.getElementById('tb_section_show').value = _allSectionName[index];
                        RequestAppointment(data["Student_ID"]);
                        unBlockUI();
                    } else {
                        unBlockUI();
                        Swal.fire({
                            type: 'error',
                            title: 'ERROR',
                            text: 'ไม่พบข้อมูลในระบบ',
                            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
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

function submitClearSearch() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        document.getElementById('search_student_id').value = "";
        document.getElementById('tb_name_show').value = "";
        document.getElementById('tb_id_show').value = "";
        document.getElementById('tb_section_show').value = "";
        document.getElementById('tb_advisor_show').value = "";
        document.getElementById('tb_username_show').value = "";
        location.reload();
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

function RequestAppointment(id) {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        if (id != "") {
            var roleAdmin = getCookie('Role');
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestStudentAppointment",
                type: "POST",
                data: {
                    'id': id,
                    'role': roleAdmin,
                },
                success: function (data) {
                    if (data) {
                        if (data.allAppData) {
                            var count = 0;
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

function initDatatable(doc, count) {
    if (doc.status == "อนุมัติ(เสร็จสิ้น)" || doc.status == "อนุมัติ") {
        var status = '<button class="btn bg-accept btn-Datatable">อนุมัติ</button>';
        var _status = "อนุมัติ";
    } else if (doc.status == "ปฏิเสธ(เสร็จสิ้น)" || doc.status == "ปฏิเสธ") {
        var status = '<button class="btn bg-decline btn-Datatable">ปฏิเสธ</button>';
        var _status = "ปฏิเสธ";
    } else if (doc.status == "รอการตอบรับ") {
        var status = '<button class="btn bg-waitAck btn-Datatable">รอการตอบรับ</button>';
        var _status = "รอการตอบรับ";
    } else if (doc.status == "ไม่มีการตอบรับ") {
        var status = '<button class="btn bg-noAnswer btn-Datatable">ไม่มีการตอบรับ</button>';
        var _status = "ไม่มีการตอบรับ";
    } else if (doc.status == "กำลังดำเนินเอกสาร") {
        var status = '<button class="btn bg-process btn-Datatable">กำลังดำเนินเอกสาร</button>';
        var _status = "กำลังดำเนินเอกสาร";
    } else if (doc.status == "ดำเนินเอกสารเสร็จสิ้น") {
        var status = '<button class="btn bg-finished btn-Datatable">ดำเนินเอกสารเสร็จสิ้น</button>';
        var _status = "ดำเนินเอกสารเสร็จสิ้น";
    } else if (doc.status == "กำลังยืมอุปกรณ์") {
        var status = '<button class="btn bg-process btn-Datatable">กำลังยืมอุปกรณ์</button>';
        var _status = "กำลังยืมอุปกรณ์";
    } else if (doc.status == "คืนอุปกรณ์แล้ว(ตรงเวลา)") {
        var status = '<button class="btn bg-finished btn-Datatable">คืนอุปกรณ์ตรงเวลา</button>';
        var _status = "คืนอุปกรณ์ตรงเวลา";
    } else if (doc.status == "คืนอุปกรณ์แล้ว(ล่าช้า)") {
        var status = '<button class="btn bg-finishedLate btn-Datatable">คืนอุปกรณ์ล่าช้า</button>';
        var _status = "คืนอุปกรณ์ล่าช้า";
    }
    table.row.add([count, doc.topic, doc.teacher, status, doc.date, doc.note_ID, doc.student_ID, doc.name, doc.date, doc.time, doc.detail, doc.day, _status, doc.declineReason]).draw();
}

function rowChild(obj) {
    var childDetail = '';
    if (obj["Status"] == "ปฏิเสธ(เสร็จสิ้น)" || obj["Status"] == "ปฏิเสธ") {
        if (obj["Teacher"] == "ฝ่ายบริการ") {
            childDetail = '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + ' <b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + ' <b style="margin-left:10px;">เหตุผลที่ปฏิเสธ : </b> ' + obj["DeclineReason"] + ' </p>';
        } else {
            childDetail = '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + ' <b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + ' <b style="margin-left:10px;">เหตุผลที่ปฏิเสธ : </b> ' + obj["DeclineReason"] + ' </p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>';
        }
    } else {
        if (obj["Teacher"] == "ฝ่ายบริการ") {
            childDetail = '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + ' <b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + '</p>';
        } else {
            childDetail = '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + ' <b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + '</p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>';
        }
    }
    return childDetail;
}

function requestTeacher() {
    var roleAdmin = getCookie('Role');
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestNameTeacherRTDB",
        type: "POST",
        data: {
            'roleAdmin': roleAdmin,
        },
        success: function (data) {
            if (data) {
                var dd_search_name = document.getElementById('sl_teacher');
                for (i = 0; i < data["allTeacherName"].length; i++) {
                    var option = document.createElement('option');
                    option.text = data["allTeacherName"][i];
                    option.value = data["alluID"][i];
                    dd_search_name.add(option, 1);
                }
            }
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });
}

function setSection() {
    var dd_section = document.getElementById('tb_section');
    for (i = 0; i < _allSectionID.length; i++) {
        var option = document.createElement('option');
        option.text = _allSectionName[i];
        option.value = _allSectionID[i];
        dd_section.add(option, 1);
    }
}

function submitAddStudent() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var name = document.getElementById('tb_name').value.toString();
        var student_id = document.getElementById('tb_id').value.toString();
        var section = document.getElementById('tb_section').value.toString();
        var advisorID = document.getElementById('sl_teacher').value.toString();
        var advisorName = $("#sl_teacher option:selected").text().toString();
        var username = document.getElementById('tb_username').value.toString().trim();
        var password = document.getElementById('tb_password').value.toString().trim();
        var confirm_password = document.getElementById('tb_confirm_password').value.toString().trim();

        var tolowerusername = username.toLocaleLowerCase();

        if (!name) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่ชื่อนักศึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!student_id) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่รหัสนักศึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!section) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกกลุ่มของนักศึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!advisorName) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกอาจารย์ที่ปรึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!username) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่ชื่อผู้ใช้',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!password) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่รหัสผ่าน',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (password.length < 6) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรขึ้นไป',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!confirm_password) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณายืนยันรหัสผ่าน',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (password != confirm_password) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            $('#md_insert_user').modal('hide');
            blockUI();
            var roleAdmin = getCookie('Role');

            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/checkStudentRepeat",
                type: "POST",
                data: {
                    'roleAdmin': roleAdmin,
                    'id': student_id,
                },
                success: function (data) {
                    if (data === "OK") {
                        $.ajax({
                            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/insertUser",
                            type: "POST",
                            data: {
                                'roleAdmin': roleAdmin,
                                'type': "2",
                                'advisorID': advisorID,
                                'advisorName': advisorName,
                                'name': name,
                                'sectionID': section,
                                'username': tolowerusername,
                                'password': password,
                            },
                            success: function (data) {
                                if (data === "OK") {
                                    unBlockUI();
                                    Swal.fire({
                                        type: 'success',
                                        title: 'SUCCESS',
                                        text: 'เพิ่มผู้ใช้สำเร็จ',
                                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                                    }).then(function () {
                                        // document.getElementById('tb_name').value = "";
                                        // document.getElementById('tb_id').value = "";
                                        // document.getElementById('tb_section').value = "";
                                        // document.getElementById('sl_teacher').value = "";
                                        // document.getElementById('tb_username').value = "";
                                        // document.getElementById('tb_password').value = "";
                                        // document.getElementById('tb_confirm_password').value = "";
                                        location.reload();
                                    })
                                } else {
                                    unBlockUI();
                                    console.log("Error API");
                                }
                            },
                            error: function (xhr, status, error) {
                                console.log('Error: ' + error.message);
                            },
                        });
                    } else {
                        unBlockUI();
                        Swal.fire({
                            type: 'error',
                            title: 'ERROR',
                            text: 'มีชื่อนักศึกษานี้อยู่ในระบบแล้ว หากต้องการเพิ่มใหม่กรุณาลบชื่อนักศึกษาเดิมก่อน',
                            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                        }).then(function () {
                            $('#md_insert_user').modal();
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

function submitChangePassword() {
    var user = firebase.auth().currentUser;
    if (user) {
        var student_id = document.getElementById('tb_id_show').value.toString();
        var password_old = document.getElementById('tb_old_password').value.toString().trim();
        var password_new = document.getElementById('tb_new_password').value.toString().trim();
        if (password_old && password_new) {
            if (password_new.length < 6) {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรขึ้นไป',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                })
            } else {
                $('#md_change_password').modal('hide');
                blockUI();
                var roleAdmin = getCookie('Role');
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/updateUserData",
                    type: "POST",
                    data: {
                        'roleAdmin': roleAdmin,
                        'type': "2",
                        'role': "NULL",
                        'password_new': password_new,
                        'password_old': password_old,
                        'id': student_id,
                    },
                    success: function (data) {
                        if (data === "OK") {
                            unBlockUI();
                            Swal.fire({
                                type: 'success',
                                title: 'SUCCESS',
                                text: 'บันทึกรหัสผ่านใหม่สำเร็จ',
                                confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                            }).then(function () {
                                // document.getElementById('search_student_id').value = "";
                                // document.getElementById('tb_name_show').value = "";
                                // document.getElementById('tb_id_show').value = "";
                                // document.getElementById('tb_section_show').value = "";
                                // document.getElementById('tb_advisor_show').value = "";
                                // document.getElementById('tb_username_show').value = "";
                                // document.getElementById('tb_old_password').value = "";
                                // document.getElementById('tb_new_password').value = "";
                                // table.clear().draw();
                                location.reload();
                            })
                        } else if (data === "PASSWORDBAD") {
                            unBlockUI();
                            Swal.fire({
                                type: 'error',
                                title: 'ERROR',
                                text: 'รหัสผ่านเดิมไม่ถูกต้อง',
                                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                            }).then(function () {
                                $("#md_change_password").modal();
                            })
                        } else {
                            console.log("Error API");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
            }
        } else {
            unBlockUI();
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่รหัสผ่านที่ต้องการบันทึก',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
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

function submitDeleteData() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        blockUI();
        var id = document.getElementById('tb_id_show').value.toString();
        if (id == "") {
            unBlockUI();
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกชื่อผู้ใช้ที่ต้องการลบ',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            var roleAdmin = getCookie('Role');
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/deleteUser",
                type: "POST",
                data: {
                    'role': roleAdmin,
                    'id': id,
                    'type': "2",
                },
                success: function (data) {
                    console.log(data)
                    if (data === "OK") {
                        unBlockUI();
                        Swal.fire({
                            type: 'success',
                            title: 'SUCCESS',
                            text: 'ลบชื่อผู้ใช้งานนี้สำเร็จ',
                            showConfirmButton: false,
                            timer: 2500
                        }).then(function () {
                            location.reload();
                        })
                    } else {
                        console.log("Error API");
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
}

function unBlockUI() {
    $.unblockUI();
}