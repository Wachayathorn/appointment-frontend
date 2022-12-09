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
                // User is signed in.
                // loadUI();
                var dd_search_name = document.getElementById('sl_teacher');

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

function parseExcelFile(inputElement) {
    var fileUpload = document.getElementById('file_timetable_upload');
    var filename = fileUpload.value;
    var allowedExtensions = /(\.xlsx|\.csv)$/i;
    if (allowedExtensions.exec(filename)) {
        var files = inputElement.files || [];
        if (!files.length) return;
        var file = files[0];

        var reader = new FileReader();
        reader.onloadend = function (event) {
            var arrayBuffer = reader.result;

            var options = { type: 'array' };
            var workbook = XLSX.read(arrayBuffer, options);

            var sheetName = workbook.SheetNames
            var sheet = workbook.Sheets[sheetName]
            var div = document.getElementById('result_timetable');
            div.innerHTML = XLSX.utils.sheet_to_html(sheet)
        };
        reader.readAsArrayBuffer(file);
    }
}

function submitUploadFile() {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var fileUpload = document.getElementById('file_timetable_upload');
        var nameteacher = document.getElementById('sl_teacher').value;

        // เช็คนามสกุลไฟล์ .xlsx กับ .csv
        var filename = fileUpload.value;
        var allowedExtensions = /(\.xlsx|\.csv)$/i;
        // console.log(allowedExtensions.exec(filename)[0]);

        if (nameteacher == "") {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: 'กรุณาเลือกชื่ออาจารย์',
                confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
            })
        } else {
            if (filename == "") {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'กรุณาเลือกไฟล์ตารางสอน',
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
                    var checkMon = document.getElementById('sjs-A7').innerHTML;
                    var checkTue = document.getElementById('sjs-A10').innerHTML;
                    var checkWed = document.getElementById('sjs-A13').innerHTML;
                    var checkThu = document.getElementById('sjs-A16').innerHTML;
                    var checkFri = document.getElementById('sjs-A19').innerHTML;
                    if (checkMon == "จันทร์" && checkTue == "อังคาร" && checkWed == "พุธ" && checkThu == "พฤหัสบดี" && checkFri == "ศุกร์") {
                        blockUI();
                        if (allowedExtensions.exec(filename)[0] === ".xlsx") {
                            console.log("Excel");
                            uploadTimetableExcel();
                        } else if (allowedExtensions.exec(filename)[0] === ".csv") {
                            console.log("CSV");
                            uploadTimetableCSV();
                        }
                    } else {
                        Swal.fire({
                            type: 'error',
                            title: 'ERROR',
                            text: 'ไฟล์ตารางสอนไม่ตรงตามรูปแบบที่กำหนด',
                            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                        })
                    }
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

function uploadTimetableExcel() {
    var role = getCookie('Role');
    var teacherName = document.getElementById('sl_teacher').value;
    var mon = [];
    var tue = [];
    var wed = [];
    var thu = [];
    var fri = [];
    var timeInDay = [mon, tue, wed, thu, fri];
    var countDayInArray = 0;
    var stringColArray = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    var stringColTimeArray = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    for (var row = 6; row < 19; row += 3) {
        var detailArray = {};
        for (var col = 0; col < 10; col++) {
            var getTDID = "sjs-" + stringColArray[col].toString() + row.toString();
            if (document.getElementById(getTDID) != null) {
                var getInnerHTML = document.getElementById(getTDID).innerHTML;
                var getColSpan = document.getElementById(getTDID).colSpan;
                var timeStart = stringColTimeArray[col];
                if (getInnerHTML) {
                    for (var time = timeStart; time < getColSpan + timeStart; time++) {
                        // var detailArray = {};
                        var timeEnd = time + 1;
                        var _time1 = time.toString() + ":00 น - " + time.toString() + ":15 น";
                        var _time2 = time.toString() + ":15 น - " + time.toString() + ":30 น";
                        var _time3 = time.toString() + ":30 น - " + time.toString() + ":45 น";
                        var _time4 = time.toString() + ":45 น - " + timeEnd.toString() + ":00 น";
                        detailArray[_time1] = true;
                        detailArray[_time2] = true;
                        detailArray[_time3] = true;
                        detailArray[_time4] = true;
                        timeInDay[countDayInArray].push(detailArray);
                    }
                } else {
                    for (var time = timeStart; time < getColSpan + timeStart; time++) {
                        // var detailArray = {};
                        var timeEnd = time + 1;
                        var _time1 = time.toString() + ":00 น - " + time.toString() + ":15 น";
                        var _time2 = time.toString() + ":15 น - " + time.toString() + ":30 น";
                        var _time3 = time.toString() + ":30 น - " + time.toString() + ":45 น";
                        var _time4 = time.toString() + ":45 น - " + timeEnd.toString() + ":00 น";
                        detailArray[_time1] = false;
                        detailArray[_time2] = false;
                        detailArray[_time3] = false;
                        detailArray[_time4] = false;
                        timeInDay[countDayInArray].push(detailArray);
                    }
                }
            }
        }
        countDayInArray++;
        if (row === 18) {
            // ยิง API
            var dataCal = [];
            for (k = 0; k < timeInDay.length; k++) {
                dataCal.push(timeInDay[k][0]);

                if (k === timeInDay.length - 1) {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/uploadTimetable",
                        type: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({
                            'teacherID': teacherName,
                            'role': role,
                            'Data': dataCal,
                        }),
                        success: function (data) {
                            console.log(data);
                        },
                        error: function (xhr, status, error) {
                            console.log('Error: ' + error.message);
                        },
                    });
                }
            }
        }
    }
}

function uploadTimetableCSV() {
    var role = getCookie('Role');
    var teacherName = document.getElementById('sl_teacher').value;
    var mon = [];
    var tue = [];
    var wed = [];
    var thu = [];
    var fri = [];
    var timeInDay = [mon, tue, wed, thu, fri];
    var countDayInArray = 0;
    var stringColArray = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    var stringColTimeArray = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    for (var row = 6; row < 19; row += 3) {
        var detailArray = {};
        for (var col = 0; col < 10; col++) {
            var rowLabLacture = row + 1;
            var getSubject = "sjs-" + stringColArray[col].toString() + row.toString();
            var getLabLacture = "sjs-" + stringColArray[col].toString() + rowLabLacture.toString();
            if (document.getElementById(getSubject) != null && document.getElementById(getLabLacture) != null) {
                var subject = document.getElementById(getSubject).innerHTML;
                var LacLacture = document.getElementById(getLabLacture).innerHTML;
                var timeStart = stringColTimeArray[col];
                if (subject && LacLacture) {
                    var returnHour = checkSubject(subject, LacLacture);
                    col = col + (returnHour - 1);
                    for (var time = timeStart; time < returnHour + timeStart; time++) {
                        // var detailArray = {};
                        var timeEnd = time + 1;
                        var _time1 = time.toString() + ":00 น - " + time.toString() + ":15 น";
                        var _time2 = time.toString() + ":15 น - " + time.toString() + ":30 น";
                        var _time3 = time.toString() + ":30 น - " + time.toString() + ":45 น";
                        var _time4 = time.toString() + ":45 น - " + timeEnd.toString() + ":00 น";
                        detailArray[_time1] = true;
                        detailArray[_time2] = true;
                        detailArray[_time3] = true;
                        detailArray[_time4] = true;
                        timeInDay[countDayInArray].push(detailArray);
                    }
                } else {
                    // var detailArray = {};
                    var timeEnd = timeStart + 1;
                    var _time1 = timeStart.toString() + ":00 น - " + timeStart.toString() + ":15 น";
                    var _time2 = timeStart.toString() + ":15 น - " + timeStart.toString() + ":30 น";
                    var _time3 = timeStart.toString() + ":30 น - " + timeStart.toString() + ":45 น";
                    var _time4 = timeStart.toString() + ":45 น - " + timeEnd.toString() + ":00 น";
                    detailArray[_time1] = false;
                    detailArray[_time2] = false;
                    detailArray[_time3] = false;
                    detailArray[_time4] = false;
                    timeInDay[countDayInArray].push(detailArray);
                }
            }
        }
        countDayInArray++;
        if (row === 18) {
            // ยิง API
            var dataCal = [];
            for (k = 0; k < timeInDay.length; k++) {
                dataCal.push(timeInDay[k][0]);

                if (k === timeInDay.length - 1) {
                    // console.log(dataCal);
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/uploadTimetable",
                        type: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({
                            'teacherID': teacherName,
                            'role': role,
                            'Data': dataCal,
                        }),
                        success: function (data) {
                            console.log(data);
                        },
                        error: function (xhr, status, error) {
                            console.log('Error: ' + error.message);
                        },
                    });
                }
            }
        }
    }
}

function checkSubject(data, data_lt) {
    var subject = data.toString().toLocaleLowerCase();
    // เช็ค Lab หรือ Lacture
    var LorT = data_lt.toString().substring(1, 2);
    // chech วิชา
    var comlab = "computer engineering laboratory";
    var pre_pro = "computer engineering pre-Project";
    var project = "computer engineering project";
    var compro = "computer programming";
    var basicElec = "basic electronics for computer engineering";
    var digital = "digital circuit and logic design";
    var adv_digital = "advanced digital system design";
    var com_archi = "computer architecture";
    var assembly = "computer organization and assembly language";
    var microcon = "microcontroller and interfacing";
    var hard_dev = "computer hardware development";
    var adv_com_archi = "advanced computer architecture";
    var robot = "micro robot development";
    var highperformance = "high performance computing";
    var embed = "embedded systems";
    var hardlab = "computer hardware laboratory";
    var special_hardware = "special topic in computer hardware laboratory";
    var special_ploblems_hard = "special problems in computer hardware";
    var topic_hardware = "advanced topics in computer hardware";
    var adv_compro = "advanced computer programming";
    var data_struc = "data structure and amdorithms";
    var soft_en = "software engineering";
    var theory = "theory of computation";
    var database = "database systems";
    var os = "operating systems";
    var SA = "system analysis and design";
    var DAA = "design and analysis of amdorithm";
    var SSD = "system software development";
    var unix = "unix system programming";
    var OOP = "object-oriented programming";
    var AI = "artificial intelligence";
    var adv_database = "advanced database systems";
    var compiler = "compiler construction";
    var OOSE = "object oriented software engineering";
    var DSP = "digital signal processing";
    var imagepro = "image processing and computer vision";
    var speech = "speech recognition";
    var mobile_device = "mobile device programming";
    var data_mining = "data mining";
    var softlab = "computer software laboratory";
    var sp_softlab = "special topic in computer software laboratory";
    var spp_comsoft = "special problems in computer software";
    var adv_comsoft = "advanced topics in computer software";
    var datacom = "data communication";
    var comnet = "computer networks";
    var tcp = "tcp/ip networks";
    var wan = "introduction to local and wide area networks";
    var IT = "internet technology";
    var camnet = "campus network design";
    var comsecure = "computer security";
    var netsecure = "network security";
    var comnetlab = "computer network laboratory";
    var sp_cnl = "special topic in computer network laboratory";
    var spp_net = "special problems in computer network";
    var adv_comnet = "advanced topics in computer network";
    var comskill = "computer and information technology skills";
    var reserved = "reserved";
    var precoop = "preparation for professional experience";
    var mathcom = "mathematics for computer engineering";
    var wire = "wireless networking";
    var research = "research methodology in electrical engineering";

    if (comlab.includes(subject) == true) {
        var hours = 6;
        return hours;
    } else if (pre_pro.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (project.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 1;
            return hours;
        } else if (LorT == "L") {
            var hours = 6;
            return hours;
        }
    } else if (compro.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (basicElec.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (digital.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (adv_digital.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (com_archi.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (assembly.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (microcon.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (hard_dev.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (adv_com_archi.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (robot.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (highperformance.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (embed.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (hardlab.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (special_hardware.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (special_ploblems_hard.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (topic_hardware.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (adv_compro.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (data_struc.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (soft_en.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (theory.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (database.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (os.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (SA.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (DAA.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (SSD.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (unix.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (OOP.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (AI.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (adv_database.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (compiler.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (OOSE.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (DSP.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (imagepro.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (speech.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (mobile_device.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (data_mining.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (softlab.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (sp_softlab.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (spp_comsoft.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (adv_comsoft.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (datacom.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (comnet.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (tcp.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (wan.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (IT.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (camnet.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (comsecure.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (netsecure.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (comnetlab.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (sp_cnl.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (spp_net.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (adv_comnet.includes(subject) == true) {
        if (LorT == "T") {
            var hours = 2;
            return hours;
        } else if (LorT == "L") {
            var hours = 3;
            return hours;
        }
    } else if (comskill.includes(subject) == true) {
        var hours = 2;
        return hours;
    } else if (reserved.includes(subject) == true) {
        var hours = 10;
        return hours;
    } else if (precoop.includes(subject) == true) {
        var hours = 2;
        return hours;
    } else if (mathcom.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (wire.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else if (research.includes(subject) == true) {
        var hours = 3;
        return hours;
    } else {
        var hours = 3;
        return hours;
    }
};

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
        message: $('#submit_progress'),
    });

    var timerId, percent;
    // reset progress bar
    percent = 0;
    $('#pay').attr('disabled', true);
    $('#load').css('width', '0%');
    $('#load').addClass('progress-bar-striped active');

    timerId = setInterval(function () {
        // increment progress bar
        percent += 1;
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
                text: 'อัพโหลดตารางสอนสำเร็จ',
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