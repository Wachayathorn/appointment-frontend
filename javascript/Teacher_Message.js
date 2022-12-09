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
}

function RequestStudentList() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var count = 0;
                var uID = getCookie('uID');
                var name = getCookie('User');
                var role = getCookie('Role');
                document.getElementById("user_login").innerHTML = name;
                if (uID != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestStudentList",
                        type: "POST",
                        data: {
                            'uID': uID,
                            'role': role,
                        },
                        success: function (data) {
                            if (data.allStudent) {
                                for (i = 0; i < data.allStudent.length; i++) {
                                    count++;
                                    initDatatable(data.allStudent[i], data.allSection[i], count);
                                }
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

function initDatatable(doc, section, count) {
    var data = []
    data.push(doc.Student_ID);
    data.push(doc.Name);
    table.row.add(['<input type="checkbox" onChange="checkbox(this.value , this)" class="checkbox-datatable" value="' + data + '">', count, doc.Student_ID, doc.Name, section]).draw();
}
function checkbox(data, check) {
    if (data === "1" && check === "1") {
        var rowcollection = table.$(".checkbox-datatable:checked", { "page": "all" });
        if (rowcollection.length !== 0) {
            rowcollection.each(function (i, e) {
                var _array = $(e).val().toString().split(',');
                iptag.tagsinput('add', { "value": _array[0], "text": _array[1] });
            })
        }
    } else if (data === "0" && check === "0") {
        iptag.tagsinput('removeAll');
        iptag.val("");
    } else {
        var arrayData = data.split(',');
        if ($(check).prop('checked')) {
            iptag.tagsinput('add', { "value": arrayData[0], "text": arrayData[1] });
        } else {
            iptag.tagsinput('remove', { "value": arrayData[0], "text": arrayData[1] });
        }
    }
}

function createMessage() {
    var title = document.getElementById('ip_title').value;
    var news = document.getElementById('ip_news').value;
    var startdate = moment.unix(Date.parse($('#startdate').datepicker('getDate')) / 1000).format("DD/MM/YYYY");
    var enddate = moment.unix(Date.parse($('#enddate').datepicker('getDate')) / 1000).format("DD/MM/YYYY");
    var startdateMillis = Date.parse($('#startdate').datepicker('getDate'));
    var enddateMillis = Date.parse($('#enddate').datepicker('getDate'));
    var uID = getCookie('uID');
    var name = getCookie('User');
    var role = getCookie('Role');
    if (!title) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาระบุหัวข้อของการนัดหมาย',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else if (!news) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาระบุข่าวสารของการนัดหมาย',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else if (!startdate) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาระบุวันที่เริ่มต้น',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else if (!enddate) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาระบุวันที่สิ้นสุด',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else if (!iptag.val()) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาระบุชื่อนักศึกษาที่ต้องการแจ้งการนัดหมายนี้',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else {
        blockUI()
        var studentList = iptag.val().split(',');
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/createMessage",
            type: "POST",
            data: {
                'role': role,
                'data': {
                    "Title": title,
                    "News": news,
                    "TeacherID": uID,
                    "TeacherName": name,
                    "Timestamp": new Date().getTime(),
                    "Startdate": startdate,
                    "Enddate": enddate,
                    "StartdateMillis": startdateMillis,
                    "EnddateMillis": enddateMillis,
                    "Student_ID": studentList,
                }
            },
            success: function (data) {
                unBlockUI();
                if (data) {
                    Swal.fire({
                        type: 'success',
                        title: 'SUCCESS',
                        text: 'ส่งการนัดหมายถึงนักศึกษาสำเร็จ',
                        confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                    }).then(function () {
                        location.reload();
                    })
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            },
        });
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