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

function RequestAppointmentTeacher() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var count = 0;
                var name = getCookie('User');
                var uID = getCookie('uID');
                var role = getCookie('Role');
                document.getElementById("user_login").innerHTML = name;
                // User is signed in.
                if (uID != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestHistory",
                        type: "POST",
                        data: {
                            'uID': uID,
                            'role': role,
                            'type': "1",
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
    }
    table.row.add([count, doc.topic, doc.name, status, doc.date, doc.note_ID, doc.student_ID, doc.teacher, doc.date, doc.time, doc.detail, doc.day, _status, doc.declineReason, doc.section, doc.advisorName]).draw();
}

function rowChild(obj) {
    var childDetail = '';
    if (obj["Status"] == "ปฏิเสธ(เสร็จสิ้น)" || obj["Status"] == "ปฏิเสธ") {
        childDetail = '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + ' <b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>กลุ่ม : </b>' + obj["Section"] + '<b style="margin-left:10px;">อาจารย์ที่ปรึกษา : </b>' + obj["Advisor"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + ' <b style="margin-left:10px;">เหตุผลที่ปฏิเสธ : </b> ' + obj["DeclineReason"] + ' </p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>';
    } else {
        childDetail = '<h5 style="margin-top:10px;"><b>หัวข้อ : </b>' + obj["Topic"] + '</h5>' + '<p><b>ชื่อ : </b>' + obj["Name"] + ' <b style="margin-left:10px;">รหัสนักศึกษา : </b>' + obj["Student_ID"] + '</p>' + '<p><b>กลุ่ม : </b>' + obj["Section"] + '<b style="margin-left:10px;">อาจารย์ที่ปรึกษา : </b>' + obj["Advisor"] + '</p>' + '<p><b>นัดหมายอาจารย์ชื่อ : </b>' + obj["Teacher"] + '</p>' + '<p><b>วัน : </b>' + obj["Day"] + '<b style="margin-left:10px;">วันที่ : </b>' + obj["Date"] + '</p>' + '<p><b>เวลา : </b>' + obj["Time"] + '</p>' + '<p><b>สถานะ : </b>' + obj["Status"] + '</p>' + '<p><b>รายละเอียดการนัดหมาย : </b>' + obj["Detail"] + '</p>';
    }
    return childDetail;
}

function RequestAppointmentReport(startdate, enddate) {
    tableofmonth.clear().draw();
    var user = firebase.auth().currentUser;
    if (user) {
        var count = 0;
        var name = getCookie('User');
        var role = getCookie('Role');
        var uID = getCookie('uID');
        // User is signed in.
        if (uID != "") {
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestHistory",
                type: "POST",
                data: {
                    'uID': uID,
                    'role': role,
                    'type': "2",
                    'startdate': startdate,
                    'enddate': enddate,
                },
                success: function (data) {
                    if (data) {
                        if (data.allAppData) {
                            var allAppointment = data.allAppData;
                            for (i = 0; i < allAppointment.length; i++) {
                                count++;
                                initDatatableReport(allAppointment[i], count);
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
        }
    }
}

function initDatatableReport(doc, count) {
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
    }
    tableofmonth.row.add([count, doc.topic, doc.name, status, doc.date, doc.note_ID, doc.student_ID, doc.teacher, doc.date, doc.time, doc.detail, doc.day, _status, doc.declineReason, doc.section, doc.advisorName]).draw();
}

var allApp = 0;
var allStatus = [];
var allTopic = [];
var _datest;
var _monthst;
var _yearst;
var _dateend;
var _monthend;
var _yearend;
// Cookie
var nameCookie;

function exportReport(startdate, enddate, _st, _end) {
    allApp = 0;
    allStatus = [];
    allTopic = [];
    if (!startdate || !enddate) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาเลือกวันที่ต้องการก่อนออกรายงานการนัดหมาย',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else {
        _datest = _st.substring(8, 11);
        _monthst = _st.substring(4, 7);
        _yearst = parseInt(_st.substring(11)) + 543;

        _dateend = _end.substring(8, 11);
        _monthend = _end.substring(4, 7);
        _yearend = parseInt(_end.substring(11)) + 543;

        var user = firebase.auth().currentUser;
        if (user) {
            nameCookie = getCookie('User');
            var role = getCookie('Role');
            var uID = getCookie('uID');
            if (nameCookie != "") {
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/reportHistory",
                    type: "POST",
                    data: {
                        'uID': uID,
                        'role': role,
                        'startdate': startdate,
                        'enddate': enddate,
                    },
                    success: function (data) {
                        if (data) {
                            if (data.allAppData) {
                                var allAppointment = data.allAppData;
                                for (i = 0; i < allAppointment.length; i++) {
                                    allApp++;
                                    allStatus.push(allAppointment[i].status);
                                    allTopic.push(allAppointment[i].topic);
                                }
                                calculate();
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
}

var statusExcel = [];
var numStatusExcel = [];
var topicExcel = [];
var numTopicExcel = [];

function calculate() {
    statusExcel = [];
    numStatusExcel = [];
    topicExcel = [];
    numTopicExcel = [];
    for (i = 0; i < allTopic.length;) {
        var getFirstArray = allTopic[0];

        if (getFirstArray == "NULL") {
            allTopic.shift();
        } else {
            topicExcel.push(getFirstArray);
            var countTopic = 1;

            for (j = 1; j < allTopic.length; j++) {
                if (getFirstArray == allTopic[j]) {
                    countTopic++;
                    allTopic[j] = "NULL";
                }
            }

            numTopicExcel.push(countTopic.toString());
            // Delete first array
            allTopic.shift();
        }
    }

    // Cal status
    for (i = 0; i < allStatus.length;) {
        var getFirstArray = allStatus[0];

        if (getFirstArray == "NULL") {
            allStatus.shift();
        } else {
            statusExcel.push(getFirstArray);
            var countStatus = 1;

            for (j = 1; j < allStatus.length; j++) {
                if (getFirstArray == allStatus[j]) {
                    countStatus++;
                    allStatus[j] = "NULL";
                }
            }

            numStatusExcel.push(countStatus.toString());
            // Delete first array
            allStatus.shift();
        }
    }
    genReportExcel();
}

async function genReportExcel() {
    var monthExcelSt;
    switch (_monthst) {
        case "Jan": monthExcelSt = "มกราคม"; break;
        case "Feb": monthExcelSt = "กุมภาพันธ์"; break;
        case "Mar": monthExcelSt = "มีนาคม"; break;
        case "Apr": monthExcelSt = "เมษายน"; break;
        case "May": monthExcelSt = "พฤษภาคม"; break;
        case "Jun": monthExcelSt = "มิถุนายน"; break;
        case "Jul": monthExcelSt = "กรกฎาคม"; break;
        case "Aug": monthExcelSt = "สิงหาคม"; break;
        case "Sep": monthExcelSt = "กันยายน"; break;
        case "Oct": monthExcelSt = "ตุลาคม"; break;
        case "Nov": monthExcelSt = "พฤศจิกายน"; break;
        case "Dec": monthExcelSt = "ธันวาคม"; break;
    }

    var monthExcelEn;
    switch (_monthend) {
        case "Jan": monthExcelEn = "มกราคม"; break;
        case "Feb": monthExcelEn = "กุมภาพันธ์"; break;
        case "Mar": monthExcelEn = "มีนาคม"; break;
        case "Apr": monthExcelEn = "เมษายน"; break;
        case "May": monthExcelEn = "พฤษภาคม"; break;
        case "Jun": monthExcelEn = "มิถุนายน"; break;
        case "Jul": monthExcelEn = "กรกฎาคม"; break;
        case "Aug": monthExcelEn = "สิงหาคม"; break;
        case "Sep": monthExcelEn = "กันยายน"; break;
        case "Oct": monthExcelEn = "ตุลาคม"; break;
        case "Nov": monthExcelEn = "พฤศจิกายน"; break;
        case "Dec": monthExcelEn = "ธันวาคม"; break;
    }

    const workbook = new ExcelJS.Workbook();

    var worksheet = workbook.addWorksheet('รายงานการนัดหมาย', {
        pageSetup: { paperSize: 9 },
        views: [{ showGridLines: false, style: 'pageLayout' }],
    });

    // Insert image
    var myBase64Image = "data:image/jpeg;base64,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";
    var img_logo = workbook.addImage({
        base64: myBase64Image,
        extension: 'png',
    });

    // adjust pageSetup settings afterwards
    worksheet.pageSetup.margins = {
        left: 0.9, right: 0.7,
        top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3
    };

    // Set style
    worksheet.getCell('A1:I32').font = {
        name: 'TH Sarabun New',
        family: 4,
        size: 16,
    };
    ////////////

    // Images
    worksheet.addImage(img_logo, 'E1:E3');

    worksheet.mergeCells('A4:I4');
    worksheet.getCell('A4').value = "เอกสารรายงานการนัดหมายอาจารย์";
    worksheet.getCell('A4').alignment = { horizontal: 'center' };
    worksheet.getCell('A4').font = {
        bold: true
    }

    worksheet.mergeCells('A5:I5');
    worksheet.getCell('A5').value = "ภาควิชาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี";
    worksheet.getCell('A5').alignment = { horizontal: 'center' };
    worksheet.getCell('A5').font = {
        bold: true
    }

    worksheet.mergeCells('A6:I6');
    worksheet.getCell('A6').value = "วันที่ " + _datest + " " + monthExcelSt + " " + _yearst + "  ถึง  " + "วันที่ " + _dateend + " " + monthExcelEn + " " + _yearend;
    worksheet.getCell('A6').alignment = { horizontal: 'center' };
    worksheet.getCell('A6').font = {
        bold: true
    }

    worksheet.mergeCells('A7:I7');
    worksheet.getCell('A7').value = "…...................................................................................................................................................................................................................";
    worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A9:I9');
    worksheet.getCell('A9').value = "ชื่ออาจารย์ : " + nameCookie;
    worksheet.getCell('A9').alignment = { horizontal: 'center' };
    worksheet.getCell('A9').font = {
        bold: true
    }

    worksheet.mergeCells('A10:C10');
    worksheet.getCell('A10').value = "1. การนัดหมายทั้งหมด";
    worksheet.getCell('A10').alignment = { horizontal: 'left' };
    worksheet.getCell('A10').font = {
        bold: true
    }

    worksheet.mergeCells('G10:H10');
    worksheet.getCell('G10').value = allApp;
    worksheet.getCell('G10').alignment = { horizontal: 'center' };
    worksheet.getCell('G10').font = {
        bold: true
    }

    worksheet.getCell('I10').value = "คน";
    worksheet.getCell('I10').font = {
        bold: true
    }

    var rowStatus = 11;
    for (i = 0; i < statusExcel.length; i++) {
        // Status

        if (statusExcel[i] == "อนุมัติ(เสร็จสิ้น)") {
            statusExcel[i] = "อนุมัติ";
        }
        if (statusExcel[i] == "ปฏิเสธ(เสร็จสิ้น)") {
            statusExcel[i] = "ปฏิเสธ";
        }

        var mergeCell = 'B' + rowStatus + ":" + 'D' + rowStatus;
        worksheet.mergeCells(mergeCell);
        worksheet.getCell('B' + rowStatus).value = "- " + statusExcel[i];
        worksheet.getCell('B' + rowStatus).alignment = { horizontal: 'left' };

        // Number Status
        var mergeCell = 'G' + rowStatus + ":" + 'H' + rowStatus;
        worksheet.mergeCells(mergeCell);
        worksheet.getCell('G' + rowStatus).value = numStatusExcel[i];
        worksheet.getCell('G' + rowStatus).alignment = { horizontal: 'center' };

        worksheet.getCell('I' + rowStatus).value = "คน";
        worksheet.getCell('I' + rowStatus).alignment = { horizontal: 'left' };
        rowStatus++;
    }

    worksheet.mergeCells('A17:C17');
    worksheet.getCell('A17').value = "2. ประเภทการนัดหมาย";
    worksheet.getCell('A17').alignment = { horizontal: 'left' };
    worksheet.getCell('A17').font = {
        bold: true
    }

    var rowType = 18;
    for (j = 0; j < topicExcel.length; j++) {
        //Topic
        var mergeCell = 'B' + rowType + ":" + 'F' + rowType;
        worksheet.mergeCells(mergeCell);
        worksheet.getCell('B' + rowType).value = "- " + topicExcel[j];
        worksheet.getCell('B' + rowType).alignment = { horizontal: 'left' };

        // Number topic
        var mergeCell = 'G' + rowType + ":" + 'H' + rowType;
        worksheet.mergeCells(mergeCell);
        worksheet.getCell('G' + rowType).value = numTopicExcel[j];
        worksheet.getCell('G' + rowType).alignment = { horizontal: 'center' };

        worksheet.getCell('I' + rowType).value = "คน";
        worksheet.getCell('I' + rowType).alignment = { horizontal: 'left' };

        rowType++;
    }

    // Save
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'APPOINTMENT_รายงานการนัดหมาย.xlsx');
}