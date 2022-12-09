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
                var uID = getCookie('uID');
                var name = getCookie('User');
                var role = getCookie('Role');
                if (i == null) {
                    document.getElementById("user_login").innerHTML = name;
                }
                // User is signed in.
                if (uID != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestlist",
                        type: "POST",
                        data: {
                            'uID': uID,
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
                                    RequestAppointmentTeacher(i = 1);
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
};

function initDatatable(doc, count) {
    var data = [];
    data.push(doc.note_ID);
    data.push(doc.teacherID);
    data.push(doc.day);
    data.push(doc.time);
    table.row.add(['<input type="checkbox" class="checkbox-datatable" value="' + data + '">', count, doc.topic, doc.name, '<img class="table-image" src="/assets/images/wait.png" style="width : 45px; height:45px;">', doc.date, doc.note_ID, doc.student_ID, doc.teacher, doc.date, doc.time, doc.detail, doc.status, doc.day, doc.teacherID, doc.section, doc.advisorName]).draw();
}

function rowChild(obj) {
    var data = [];
    data.push(obj["Note_ID"]);
    data.push(obj["TeacherID"]);
    data.push(obj["Day"]);
    data.push(obj["Time"]);
    return '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + '<b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>กลุ่ม : </b>' + obj["Section"] + '<b style="margin-left:10px;">อาจารย์ที่ปรึกษา : </b>' + obj["Advisor"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + '</p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>' + '<button type="button" class="btn btn-danger" value="' + data + '"  onclick="decline(this.value)" style="width: 110px">ปฏิเสธ</button> <button type="button" class="btn btn-success" value="' + data + '"  onclick="accept(this.value)" style="width: 110px">อนุมัติ</button>';
}

function accept(note) {
    blockUI();
    // ยิง API
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/accept",
        type: "POST",
        data: {
            'appID': note,
        },
        success: function (data) {
            if (data) {
                unBlockUI();
                Swal.fire({
                    type: 'success',
                    title: 'SUCCESS',
                    text: 'อนุมัติสำเร็จ',
                    confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                }).then(function () {
                    table.clear().draw();
                    RequestAppointmentTeacher(i = 1);
                })
            }
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });
}

function decline(note) {
    Swal.fire({
        title: 'WARNING',
        text: 'เหตุผลที่ปฏิเสธการนัดหมายนี้ ?',
        type: 'warning',
        input: 'select',
        inputOptions: {
            ติดราชการ: 'ติดราชการ',
            ลา: 'ลา',
            อื่นๆ: 'อื่นๆ',
        },
        inputPlaceholder: 'เลือกเหตุผลที่ปฏิเสธ',
        showCancelButton: true,
        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
        cancelButtonText: '<i class="fa fa-times"></i> ยกเลิก',
        reverseButtons: true,
        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (value == "") {
                    resolve('กรุณาเลือกเหตุผลที่ปฏิเสธการนัดหมายนี้ !');
                } else if (value == "อื่นๆ") {
                    Swal.fire({
                        title: 'WARNING',
                        text: 'เหตุผลอื่นๆที่ปฏิเสธการนัดหมายนี้ ?',
                        type: 'warning',
                        input: 'text',
                        inputAttributes: {
                            autocapitalize: 'off'
                        },
                        inputPlaceholder: 'ระบุเหตุผลอื่นๆที่ปฏิเสธการนัดหมายนี้',
                        showCancelButton: true,
                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                        cancelButtonText: '<i class="fa fa-times"></i> ยกเลิก',
                        reverseButtons: true,
                        inputValidator: (value) => {
                            if (value == "") {
                                return 'กรุณาระบุเหตุผลอื่นๆที่ปฏิเสธการนัดหมายนี้ !'
                            } else {
                                declineUpdateDB(note, value);
                            }
                        }
                    })
                } else {
                    // Value จาก Select
                    resolve(declineUpdateDB(note, value));
                }
            })
        }
    })
}

function declineUpdateDB(note, reason) {
    blockUI();
    // ยิง API
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/decline",
        type: "POST",
        data: {
            'appID': note,
            'reasonDecline': reason,
        },
        success: function (data) {
            if (data) {
                unBlockUI();
                Swal.fire({
                    type: 'success',
                    title: 'SUCCESS',
                    text: 'ปฏิเสธสำเร็จ',
                    confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                }).then(function () {
                    table.clear().draw();
                    RequestAppointmentTeacher(i = 1);
                })
            }
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });
}

function allAccept() {
    var rowcollection = table.$(".checkbox-datatable:checked", { "page": "all" });
    if (rowcollection.length == 0) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาเลือกรายการนัดหมายที่ต้องการอนุมัติ !',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else {
        blockUI();
        var countRow = 0;
        rowcollection.each(function (i, e) {
            var arrayNote = $(e).val();
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/accept",
                type: "POST",
                data: {
                    'appID': arrayNote,
                },
                success: function (data) {
                    if (data) {
                        countRow++;
                        if (countRow == rowcollection.length) {
                            unBlockUI();
                            Swal.fire({
                                type: 'success',
                                title: 'SUCCESS',
                                text: 'อนุมัติรายการที่เลือกสำเร็จ',
                                confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                            }).then(function () {
                                $('[name=select_all]').prop('checked', false);
                                table.clear().draw();
                                RequestAppointmentTeacher(i = 1);
                            })
                        }
                    }
                },
                error: function (xhr, status, error) {
                    console.log('Error: ' + error.message);
                },
            });
        })
    }
}

function allDecline() {
    var rowcollection = table.$(".checkbox-datatable:checked", { "page": "all" });
    if (rowcollection.length == 0) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาเลือกรายการนัดหมายที่ต้องการปฏิเสธ !',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else {
        Swal.fire({
            title: 'WARNING',
            text: 'เหตุผลที่ปฏิเสธการนัดหมายนี้ ?',
            type: 'warning',
            input: 'select',
            inputOptions: {
                ติดราชการ: 'ติดราชการ',
                ลา: 'ลา',
                อื่นๆ: 'อื่นๆ',
            },
            inputPlaceholder: 'เลือกเหตุผลที่ปฏิเสธ',
            showCancelButton: true,
            confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
            cancelButtonText: '<i class="fa fa-times"></i> ยกเลิก',
            reverseButtons: true,
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value == "") {
                        resolve('กรุณาเลือกเหตุผลที่ปฏิเสธการนัดหมายนี้ !');
                    } else if (value == "อื่นๆ") {
                        Swal.fire({
                            title: 'WARNING',
                            text: 'เหตุผลอื่นๆที่ปฏิเสธการนัดหมายนี้ ?',
                            type: 'warning',
                            input: 'text',
                            inputAttributes: {
                                autocapitalize: 'off'
                            },
                            inputPlaceholder: 'ระบุเหตุผลอื่นๆที่ปฏิเสธการนัดหมายนี้',
                            showCancelButton: true,
                            confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                            cancelButtonText: '<i class="fa fa-times"></i> ยกเลิก',
                            reverseButtons: true,
                            inputValidator: (value) => {
                                if (value == "") {
                                    return 'กรุณาระบุเหตุผลอื่นๆที่ปฏิเสธการนัดหมายนี้ !'
                                } else {
                                    allDeclineUpdateDB(value);
                                }
                            }
                        })
                    } else {
                        // Value จาก Select
                        resolve(allDeclineUpdateDB(value));
                    }
                })
            }
        })
    }
}

function allDeclineUpdateDB(reason) {
    blockUI();
    var rowcollection = table.$(".checkbox-datatable:checked", { "page": "all" });
    var countRow = 0;
    rowcollection.each(function (i, e) {
        var arrayNote = $(e).val();
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/decline",
            type: "POST",
            data: {
                'appID': arrayNote,
                'reasonDecline': reason,
            },
            success: function (data) {
                if (data) {
                    countRow++;
                    if (countRow == rowcollection.length) {
                        unBlockUI();
                        Swal.fire({
                            type: 'success',
                            title: 'SUCCESS',
                            text: 'ปฏิเสธรายการที่เลือกสำเร็จ',
                            confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                        }).then(function () {
                            $('[name=select_all]').prop('checked', false);
                            table.clear().draw();
                            RequestAppointmentTeacher(i = 1);
                        })
                    }
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            },
        });
    })
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