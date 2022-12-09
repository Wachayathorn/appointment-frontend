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

function RequestDropdownName() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                // blockUI();
                $('#opt_teacher').empty();
                $('#opt_manage').empty();
                $('#opt_service').empty();

                var role = getCookie('Role');

                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestAllTeacher",
                    type: "POST",
                    data: {
                        'roleAdmin': role,
                    },
                    success: function (data) {
                        // unBlockUI();
                        if (data.teacherName) {
                            var Data = data.teacherName;
                            for (i = 0; i < Data.length; i++) {
                                if (Data[i]["Role"] === "แอดมิน") {
                                } else if (Data[i]["Role"] == "อาจารย์") {
                                    $("<option>").val(Data[i]["uID"]).text(Data[i]["Name_prefix"] + Data[i]["Name"]).appendTo("#opt_teacher");
                                } else if (Data[i]["Role"] == "ฝ่ายธุรการ") {
                                    $("<option>").val(Data[i]["uID"]).text(Data[i]["Name_prefix"] + Data[i]["Name"]).appendTo("#opt_manage");
                                } else if (Data[i]["Role"] == "ฝ่ายบริการ") {
                                    $("<option>").val(Data[i]["uID"]).text(Data[i]["Name_prefix"] + Data[i]["Name"]).appendTo("#opt_service");
                                }
                            }
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

function checkbox(data, check) {
    var arrayData = data.split(',');
    if ($(check).prop('checked')) {
        iptag.tagsinput('add', { "value": arrayData[0], "text": arrayData[1] });
    } else {
        iptag.tagsinput('remove', { "value": arrayData[0], "text": arrayData[1] });
    }
}

// function addMentor() {
//     $('#md_add_section').modal('hide');
//     var listSection = iptag.val().split(',');
//     var teacherId = document.getElementById('sl_search_name').value.toString();
//     var role = getCookie('Role');

//     if (iptag.val()) {
//         blockUI();
//         $.ajax({
//             url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/addMentor",
//             type: "POST",
//             data: {
//                 'roleAdmin': role,
//                 'teacherID': teacherId,
//                 'sectionID': listSection,
//             },
//             success: function (data) {
//                 if (data === "OK") {
//                     unBlockUI();
//                     Swal.fire({
//                         type: 'success',
//                         title: 'SUCCESS',
//                         text: 'เพิ่มกลุ่มนักศึกษาที่ดูแลสำเร็จ',
//                         confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
//                     }).then(function () {
//                         submitSearchTeacherName();
//                     })
//                 } else {
//                     unBlockUI();
//                     Swal.fire({
//                         type: 'error',
//                         title: 'ERROR',
//                         text: 'Error !',
//                         confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
//                     }).then(function () {
//                         $('#md_add_section').modal();
//                     })
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.log('Error: ' + error.message);
//             },
//         });
//     } else {
//         unBlockUI();
//         Swal.fire({
//             type: 'error',
//             title: 'ERROR',
//             text: 'กรุณาเลือกกลุ่มนักศึกษาที่ต้องการเพิ่ม !',
//             confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
//         }).then(function () {
//             $('#md_add_section').modal();
//         })
//     }
// }

var _sectionCurrent = [];

function submitSearchTeacherName() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var id = document.getElementById('sl_search_name').value.toString();
        var roleAdmin = getCookie('Role');

        if (id) {
            blockUI();
            var array_mentor = [];
            var ID = [];
            var Section = [];
            var _searchdata = new Promise((resolve, reject) => {
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/searchUser",
                    type: "POST",
                    data: {
                        'roleAdmin': roleAdmin,
                        'name': id,
                        'type': "1"
                    },
                    success: function (data) {
                        if (data) {
                            _sectionCurrent = [];
                            document.getElementById('tb_nameprefix_show').value = data["Name_prefix"];
                            document.getElementById('tb_name_show').value = data["Name"];
                            document.getElementById('tb_role_show').value = data["Role"];
                            document.getElementById('tb_username_show').value = data["Username"];
                            if (data["Role"] === "อาจารย์") {
                                $('#row_section').slideDown('slow');
                            } else {
                                $('#row_section').slideUp('slow');
                            }
                            array_mentor = data["Mentor"];
                            resolve("OK");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
            });

            var _allsection = new Promise((resolve, reject) => {
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestAllSection",
                    type: "POST",
                    data: {
                        'roleAdmin': roleAdmin,
                    },
                    success: function (data) {
                        if (data.id) {
                            ID = data.id;
                            Section = data.section;
                            resolve("OK");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
            })

            Promise.all([_searchdata, _allsection]).then(values => {
                if (values[0] === "OK" && values[1] === "OK") {
                    unBlockUI();
                    table_section.clear().draw();
                    if (array_mentor !== "-") {
                        var count = 0;
                        for (var i = 0; i < array_mentor.length; i++) {
                            for (var j = 0; j < ID.length; j++) {
                                if (array_mentor[i] === ID[j]) {
                                    count++;
                                    var data = [array_mentor[i], Section[j]];
                                    _sectionCurrent.push(array_mentor[i]);
                                    table_section.row.add([count, Section[j], '<button type="button" class="btn btn-danger" value="' + array_mentor[i] + '"  onclick="deleteSection(this.value)" style="width: 110px; padding:12px"><i class="fa fa-fw fa-trash-o"></i> ลบ</button> <button type="button" class="btn btn-orange" value="' + data + '"  onclick="editNameSection(this.value)" style="width: 110px; padding:12px"><i class="fa fa-fw fa-pencil-square-o"></i> แก้ไข</button>']).draw();
                                    break;
                                }
                            }
                        }
                    }
                }
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

function requestAllSection() {
    var user = firebase.auth().currentUser;
    if (user) {
        var roleAdmin = getCookie('Role');
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestAllSection",
            type: "POST",
            data: {
                'roleAdmin': roleAdmin,
            },
            success: function (data) {
                if (data.id) {
                    var ID = data.id;
                    var Section = data.section;
                    table_add_section.clear().draw();
                    for (i = 0; i < ID.length; i++) {
                        var index = _sectionCurrent.indexOf(ID[i]);
                        if (index === -1) {
                            var data = [ID[i], Section[i]];
                            table_add_section.row.add(['<input type="checkbox" onChange="checkbox(this.value , this)" class="checkbox-datatable" value="' + data + '">', Section[i]]).draw();
                        }
                    }
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            },
        });
    }
}

function deleteSection(id) {
    var roleAdmin = getCookie('Role');
    var uID = document.getElementById('sl_search_name').value.toString();

    Swal.fire({
        title: 'WARNING',
        text: "ต้องการลบกลุ่มนักศึกษานี้ ?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
        cancelButtonText: '<i class="fa fa-times"></i> ยกเลิก',
        reverseButtons: true
    }).then((result) => {
        if (result.value) {
            blockUI();
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/deleteMentor",
                type: "POST",
                data: {
                    'roleAdmin': roleAdmin,
                    'teacherID': uID,
                    'sectionID': id,
                },
                success: function (data) {
                    if (data === "OK") {
                        var index = _sectionCurrent.indexOf(id);
                        if (index !== -1) {
                            _sectionCurrent.splice(index, 1);
                        }
                        unBlockUI();
                        Swal.fire({
                            type: 'success',
                            title: 'SUCCESS',
                            text: 'ลบกลุ่มนักศึกษาสำเร็จ',
                            showConfirmButton: false,
                            timer: 2500
                        }).then(function () {
                            submitSearchTeacherName();
                        })
                    }
                },
                error: function (xhr, status, error) {
                    console.log('Error: ' + error.message);
                },
            });
        }
    })
}

var _sectionID = "";

function editNameSection(data) {
    $("#md_edit_section").modal();
    var _data = data.split(',');
    _sectionID = _data[0];
    $('#text_old_section').text("ชื่อกลุ่มเดิม : " + _data[1]);
    $('#tb_new_section').val(_data[1]);
}

function submitEditNameSection() {
    $('#md_edit_section').modal('hide');
    blockUI();

    var roleAdmin = getCookie('Role');
    var secName = document.getElementById('tb_new_section').value.toString();
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/checkSection",
        type: "POST",
        data: {
            'roleAdmin': roleAdmin,
            'section': secName,
        },
        success: function (data) {
            if (data === "OK") {
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/editMentor",
                    type: "POST",
                    data: {
                        'roleAdmin': roleAdmin,
                        'sectionID': _sectionID,
                        'sectionName': secName,
                    },
                    success: function (data) {
                        if (data === "OK") {
                            unBlockUI();
                            Swal.fire({
                                type: 'success',
                                title: 'SUCCESS',
                                text: 'แก้ไขชื่อกลุ่มนักศึกษานี้สำเร็จ',
                                confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                            }).then(function () {
                                submitSearchTeacherName();
                            })
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });

            } else if (data === "Repeat") {
                unBlockUI();
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'มีกลุ่มนี้อยู่ในระบบแล้ว !',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                }).then(function () {
                    $('#md_edit_section').modal();
                })
            }
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        },
    });
}

function submitAddTeacher() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var name_prefix = document.getElementById('tb_nameprefix').value.toString();
        var name = document.getElementById('tb_name').value.toString();
        var role = document.getElementById('sl_role').value.toString();
        var username = document.getElementById('tb_username').value.toString().trim();
        var password = document.getElementById('tb_password').value.toString().trim();
        var confirm_password = document.getElementById('tb_confirm_password').value.toString().trim();

        var tolowerusername = username.toLocaleLowerCase();

        // Check ตัวอักษรพิเศษ
        // any character that is not a word character or whitespace
        var regex = /[^\w\s]/g;
        var checkRegex = username.search(regex);
        // console.log(username.search(regex));
        // console.log(username[username.search(regex)]);

        if (name_prefix == "") {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่คำนำหน้าชื่อ',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (name == "") {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่ชื่ออาจารย์หรือเจ้าหน้าที่',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (role == "") {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกสิทธิ์ในการเข้าใช้',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (username == "") {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาใส่ชื่อผู้ใช้',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (checkRegex != -1) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'ห้ามใส่อักขระใดๆ ที่ไม่ใช่ตัวอักษร คำหรือช่องว่างในชื่อผู้ใช้',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (password == "") {
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
        } else if (confirm_password == "") {
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
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/checkUserData",
                type: "POST",
                data: {
                    'role': roleAdmin,
                    'namecheck': tolowerusername,
                    'type': "1",
                },
                success: function (data) {
                    // console.log(data);
                    if (data) {
                        if (data === "OK") {
                            $.ajax({
                                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/insertUser",
                                type: "POST",
                                data: {
                                    'roleAdmin': roleAdmin,
                                    'type': "1",
                                    'nameprefix': name_prefix,
                                    'name': name,
                                    'role': role,
                                    'mentor': "-",
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
                                            // document.getElementById('tb_nameprefix').value = "";
                                            // document.getElementById('tb_name').value = "";
                                            // document.getElementById('sl_role').value = "";
                                            // document.getElementById('tb_username').value = "";
                                            // document.getElementById('tb_password').value = "";
                                            // document.getElementById('tb_confirm_password').value = "";
                                            // RequestDropdownName();
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
                        } else {
                            unBlockUI();
                            Swal.fire({
                                type: 'error',
                                title: 'ERROR',
                                text: 'มีชื่อผู้ใช้นี้อยู่ในระบบแล้ว กรุณาเปลี่ยนชื่อผู้ใช้ใหม่',
                                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                            }).then(function () {
                                $("#md_insert_user").modal();
                            })
                        }
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

function submitDeleteTeacher() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        blockUI();
        var name = document.getElementById('tb_name_show').value.toString();
        if (name == "") {
            unBlockUI();
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกชื่อผู้ใช้ที่ต้องการลบ',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            var role = getCookie('Role');
            var id = document.getElementById('sl_search_name').value.toString();
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/deleteUser",
                type: "POST",
                data: {
                    'role': role,
                    'id': id,
                    'type': "1",
                },
                success: function (data) {
                    console.log(data);
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

function submitChangeUsername() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var id = document.getElementById('sl_search_name').value.toString();
        var name_prefix = document.getElementById('tb_nameprefix_show').value.toString().trim();
        var name_search = document.getElementById('tb_name_show').value.toString();
        var role = document.getElementById('tb_role_show').value.toString();
        var username = document.getElementById('tb_username_show').value.toString().trim();

        var tolowerusername = username.toLocaleLowerCase();

        if (!id && !name_search) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกชื่อที่ต้องการแก้ไขข้อมูลก่อนกดบันทึก',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            var regex = /[^\w\s]/g;
            var checkRegex = username.search(regex);
            if (!name_prefix) {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'กรุณาใส่คำนำหน้าชื่อ',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                })
            } else if (!name_search) {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'กรุณาใส่ชื่อ-นามสกุล',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                })
            } else if (checkRegex != -1) {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'ห้ามใส่อักขระใดๆ ที่ไม่ใช่ตัวอักษร คำหรือช่องว่างในชื่อผู้ใช้',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                })
            } else {
                blockUI();
                var roleAdmin = getCookie('Role');
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/checkUserData",
                    type: "POST",
                    data: {
                        'role': roleAdmin,
                        'namecheck': tolowerusername,
                        'id': id,
                        'type': "2",
                    },
                    success: function (data) {
                        // console.log(data);
                        if (data) {
                            if (data === "OK") {
                                $.ajax({
                                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/updateUserData",
                                    type: "POST",
                                    data: {
                                        'roleAdmin': roleAdmin,
                                        'type': "1",
                                        'name_prefix': name_prefix,
                                        'name': name_search,
                                        'role': role,
                                        'username': tolowerusername,
                                        'id': id,
                                    },
                                    success: function (data) {
                                        if (data === "OK") {
                                            unBlockUI();
                                            Swal.fire({
                                                type: 'success',
                                                title: 'SUCCESS',
                                                text: 'บันทึกข้อมูลใหม่สำเร็จ',
                                                confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                                            }).then(function () {
                                                // document.getElementById('tb_nameprefix_show').value = "";
                                                // document.getElementById('tb_name_show').value = "";
                                                // document.getElementById('tb_role_show').value = "";
                                                // document.getElementById('tb_username_show').value = "";
                                                // RequestDropdownName();
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
                            } else {
                                unBlockUI();
                                Swal.fire({
                                    type: 'error',
                                    title: 'ERROR',
                                    text: 'มีชื่อผู้ใช้นี้อยู่ในระบบแล้ว กรุณาเปลี่ยนชื่อผู้ใช้ใหม่',
                                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                                })
                            }
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
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
            location.reload();
        }
    }
}

function submitChangePassword() {
    var user = firebase.auth().currentUser;
    if (user) {
        var id = document.getElementById('sl_search_name').value.toString();
        var role = document.getElementById('tb_role_show').value.toString();
        var password_old = document.getElementById('tb_old_password').value.toString().trim();
        var password_new = document.getElementById('tb_new_password').value.toString().trim();
        if (id) {
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
                            'role': role,
                            'password_new': password_new,
                            'password_old': password_old,
                            'id': id,
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
                                    // document.getElementById('tb_nameprefix_show').value = "";
                                    // document.getElementById('tb_name_show').value = "";
                                    // document.getElementById('tb_role_show').value = "";
                                    // document.getElementById('tb_username_show').value = "";
                                    // document.getElementById('tb_old_password').value = "";
                                    // document.getElementById('tb_new_password').value = "";
                                    // RequestDropdownName();
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
            unBlockUI();
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกผู้ใช้งานที่ต้องการเปลี่ยนรหัสผ่าน',
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