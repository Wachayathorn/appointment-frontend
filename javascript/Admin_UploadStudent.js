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
            // loadUI();
            var roleAdmin = getCookie('Role');
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestNameTeacherRTDB",
                type: "POST",
                data: {
                    'roleAdmin': roleAdmin,
                },
                success: function (data) {
                    // unBlockUI();
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
    });
}

function submitUploadFile() {
    var user = firebase.auth().currentUser;
    if (user) {
        var fileUpload = document.getElementById('input_file_student');
        var sl_nameTeacher = document.getElementById('sl_teacher').value;
        var ip_section = document.getElementById('ip_section').value.toString().trim();
        var filename = fileUpload.value;
        var allowedExtensions = /(\.xlsx|\.csv)$/i;

        if (filename == "") {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกไฟล์รายชื่อนักศึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!ip_section) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาระบุกลุ่มของนักศึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else if (!sl_nameTeacher) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกอาจารย์ที่ปรึกษา',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            if (!allowedExtensions.exec(filename)) {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'กรุณาเลือกไฟล์ Excel หรือ CSV(UTF-8) เท่านั้น',
                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                })
            } else {
                var checkListNameOrTimetable = document.getElementById('sjs-B1').innerHTML;
                if (checkListNameOrTimetable.startsWith("11")) {
                    sendAPI(ip_section, sl_nameTeacher, $("#sl_teacher option:selected").text());
                } else {
                    Swal.fire({
                        type: 'error',
                        title: 'ERROR',
                        text: 'ไฟล์รายชื่อนักศึกษาไม่ตรงตามรูปแบบที่กำหนด',
                        confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                    })
                }
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

var allData = [];

function processReadFile() {
    var fileUpload = document.getElementById('input_file_student');
    var filename = fileUpload.value;
    var allowedExtensions = /(\.xlsx|\.csv)$/i;
    if (allowedExtensions.exec(filename)) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    // ProcessExcelColumn(e.target.result);
                    ProcessExcelNoneColumn(e.target.result);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    // ProcessExcelColumn(data);
                    ProcessExcelNoneColumn(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            unblockUI();
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'บราวเซอร์ของคุณไม่รองรับ HTML5 กรุณาใช้บราวเซอร์อื่น',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        }
    }
}

function ProcessExcelNoneColumn(data) {
    allData = [];
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    var result_student = document.getElementById('result_student');
    result_student.innerHTML = XLSX.utils.sheet_to_html(workbook.Sheets[firstSheet]);

    for (var i = 0; i <= excelRows.length; i++) {
        var row = i + 1;
        var colB = document.getElementById('sjs-B' + row.toString()).innerHTML;
        var colC = document.getElementById('sjs-C' + row.toString()).innerHTML;

        var a_id = colB.substring(7, 12);
        var b_id = colB.substring(13);
        // console.log(a_id + b_id);

        var name = colC;
        var student_id = colB;
        var email = student_id + "@cpe.ac.th";
        var password = a_id + b_id;

        var obj = {
            "name": name,
            "id": student_id,
            "email": email,
            "pass": password,
        };

        allData.push(obj);
    }
}

function sendAPI(section, advisorID, advisorName) {
    var role = getCookie('Role');
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/checkSection",
        type: "POST",
        data: {
            'roleAdmin': role,
            'section': section,
        },
        success: function (data) {
            if (data === "OK") {
                blockUI();
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/uploadFileStudent",
                    type: "POST",
                    data: {
                        'roleAdmin': role,
                        'allData': allData,
                        'advisorID': advisorID,
                        'advisorName': advisorName,
                        'section': section,
                    },
                    success: function (data) {
                        if (data) {
                            console.log(data);
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    },
                });
            } else if (data === "Repeat") {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'มีกลุ่มนักศึกษานี้อยู่ในระบบแล้ว !',
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
        message: $('#submit_progress')
    });

    var timerId, percent;
    // reset progress bar
    percent = 0;
    $('#pay').attr('disabled', true);
    $('#load').css('width', '0%');
    $('#load').addClass('progress-bar-striped active');

    timerId = setInterval(function () {
        // increment progress bar
        percent += 2;
        $('#load').css('width', percent + '%');
        $('#load').html(percent + '%');

        // complete
        if (percent >= 100) {
            clearInterval(timerId);
            $('#pay').attr('disabled', false);
            $('#load').removeClass('progress-bar-striped active');
            $('#load').html('Upload success');

            unBlockUI();
            $('#load').css('width', '0%');
            $('#load').html('0%');
            Swal.fire({
                type: 'success',
                title: 'SUCCESS',
                text: 'อัพโหลดรายชื่อนักศึกษาสำเร็จ',
                confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
            })
        }
    }, 100);
}

function loadUI() {
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