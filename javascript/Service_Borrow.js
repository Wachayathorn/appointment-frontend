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
                                    confirmButtonText: '<i class="fa fa-times"></i> ????????????',
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
                    text: '?????????????????????????????????????????????????????????????????????????????? !',
                    confirmButtonText: '<i class="fa fa-times"></i> ????????????',
                }).then(function () {
                    window.location.href = "/index.html";
                })
            } else {
                window.location.href = "/index.html";
            }
        }
    });
}

var toolsArray;
var NumberArray;

function initDatatable(doc, count) {
    doc.tool.forEach(forEachArrayTools);
    doc.toolNumber.forEach(forEachArrayNumberOfTools);
    table.row.add([count, toolsArray, doc.name, doc.date, doc.dateBack, '<button class="btn btn-success" value="' + doc.note_ID + '"  onclick="callFile (this.value)"><img src="/assets/images/xlsx.png" height=15px" width="15px"></button>', doc.note_ID, doc.student_ID, doc.teacher, doc.time, doc.topic, doc.status, doc.day, NumberArray, doc.section, doc.advisorName]).draw();
}

function forEachArrayTools(item, index) {
    if (item != "") {
        if (index == 0) {
            toolsArray = item;
        } else {
            toolsArray += " / " + item;
        }
    }
}

function forEachArrayNumberOfTools(item, index) {
    if (item != "") {
        if (index == 0) {
            NumberArray = item + " ????????????";
        } else {
            NumberArray += " / " + item + " ????????????";
        }
    }
}

function rowChild(obj) {
    return '<h5 style="margin-top:10px;"><b>?????????????????? : </b>' + obj["Topic"] + '</h5>' + '<p><b>???????????? : </b>' + obj["Name"] + '<b style="margin-left:10px;">???????????????????????????????????? : </b>' + obj["Student_ID"] + '</p>' + '<p><b>??????????????? : </b>' + obj["Section"] + '<b style="margin-left:10px;">???????????????????????????????????????????????? : </b>' + obj["Advisor"] + '</p>' + '</p>' + '<p><b>????????????????????? : </b>' + obj["Teacher"] + '</p>' + '<p><b>????????? : </b>' + obj["Day"] + '<b style="margin-left:10px;">?????????????????? : </b>' + obj["Date"] + '</p>' + '<p><b>???????????? : </b>' + obj["Time"] + '</p>' + '<p><b>????????????????????????????????????????????? : </b>' + obj["Tool"] + '</p>' + '<p><b>??????????????? : </b>' + obj["Num"] + '</p>' + '<p><b>???????????????????????????????????????????????? : </b>' + obj["DateBack"] + '</p>' + '<p><b>??????????????? : </b>' + obj["Status"] + '</p>' + '<button type="button" class="btn btn-danger" value="' + obj["Note_ID"] + '"  onclick="processFinishedLate(this.value)">???????????????????????????</button>' + '<button type="button" class="btn btn-orange" value="' + obj["Note_ID"] + '"  onclick="processFinished(this.value)">??????????????????????????????</button>';
}

function processFinished(note) {
    blockUI();
    var role = getCookie('Role');
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/processToolBack",
        type: "POST",
        data: {
            'role': role,
            'time': "?????????????????????",
            'note_id': note,
            'timeBackMillis': new Date().getTime(),
        },
        success: function (data) {
            if (data) {
                unBlockUI();
                Swal.fire({
                    type: 'success',
                    title: 'SUCCESS',
                    text: '?????????????????????????????????????????? (???????????????????????????????????????????????????????????????????????????)',
                    confirmButtonText: '<i class="fa fa-check"></i> ????????????',
                }).then(function () {
                    table.clear().draw();
                    RequestAppointmentTeacher(i = 1);
                })
            } else {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'Error !',
                    confirmButtonText: '<i class="fa fa-times"></i> ????????????',
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

function processFinishedLate(note) {
    blockUI();
    var role = getCookie('Role');
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/processToolBack",
        type: "POST",
        data: {
            'role': role,
            'time': "??????????????????",
            'note_id': note,
            'timeBackMillis': new Date().getTime(),
        },
        success: function (data) {
            if (data) {
                unBlockUI();
                Swal.fire({
                    type: 'success',
                    title: 'SUCCESS',
                    text: '?????????????????????????????????????????? (????????????????????????????????????????????????????????????????????????????????????????????????)',
                    confirmButtonText: '<i class="fa fa-check"></i> ????????????',
                }).then(function () {
                    table.clear().draw();
                    RequestAppointmentTeacher(i = 1);
                })
            } else {
                Swal.fire({
                    type: 'error',
                    title: 'ERROR',
                    text: 'Error !',
                    confirmButtonText: '<i class="fa fa-times"></i> ????????????',
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

var nameStudent;
var student_id;
var _topic;
var purpose;
var dateBackExcel;
var toolExcel;
var toolNumberExcel;
var dateBorrowExcel;

function callFile(note) {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        var name = getCookie('User');
        var role = getCookie('Role');

        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/excelService",
            type: "POST",
            data: {
                'role': role,
                'note_id': note,
            },
            success: function (data) {
                if (data) {
                    nameStudent = data.nameStudent;
                    student_id = data.student_id;
                    _topic = data._topic;
                    purpose = data.purpose;
                    dateBackExcel = data.dateBackExcel;
                    toolExcel = data.toolExcel;
                    toolNumberExcel = data.toolNumberExcel;
                    dateBorrowExcel = data.dateBorrowExcel;

                    createExcel();
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            },
        });
    } else {
        // No user is signed in.
        console.log("No user signed in");
        var name = getCookie('User');
        if (!name) {
            Swal.fire({
                type: 'error',
                title: 'ERROR',
                text: '?????????????????????????????????????????????????????????????????????????????? !',
                confirmButtonText: '<i class="fa fa-times"></i> ????????????',
            }).then(function () {
                window.location.href = "/index.html";
            })
        } else {
            location.reload();
        }
    }
}

async function createExcel() {
    const workbook = new ExcelJS.Workbook();

    var worksheet = workbook.addWorksheet('????????????????????????????????????-?????????', {
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
    worksheet.getCell('A4').value = "????????????????????????????????????-????????????????????????????????????????????????????????????????????????????????????????????????????????????";
    worksheet.getCell('A4').alignment = { horizontal: 'center' };
    worksheet.getCell('A4').font = {
        bold: true
    }

    worksheet.mergeCells('A5:I5');
    worksheet.getCell('A5').value = "???...................................................................................................................................................................................................................";
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };


    worksheet.mergeCells('A6:B6');
    worksheet.getCell('A6').value = "???????????? - ????????????????????? :";
    worksheet.getCell('A6').alignment = { horizontal: 'left' };
    worksheet.getCell('A6').font = {
        bold: true
    }

    worksheet.mergeCells('C6:D6');
    worksheet.getCell('C6').value = nameStudent;
    worksheet.getCell('C6').alignment = { horizontal: 'center' };

    worksheet.mergeCells('E6:F6');
    worksheet.getCell('E6').value = "???????????????????????????????????? :";
    worksheet.getCell('E6').alignment = { horizontal: 'right' };
    worksheet.getCell('E6').font = {
        bold: true
    }

    worksheet.mergeCells('G6:I6');
    worksheet.getCell('G6').value = student_id;
    worksheet.getCell('G6').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A7:B7');
    worksheet.getCell('A7').value = "??????????????????????????????????????? :";
    worksheet.getCell('A7').alignment = { horizontal: 'left' };
    worksheet.getCell('A7').font = {
        bold: true
    }

    worksheet.mergeCells('C7:D7');
    worksheet.getCell('C7').value = "???...........................................";
    worksheet.getCell('C7').alignment = { horizontal: 'center' };
    worksheet.getCell('C7').font = {
        bold: true
    }

    worksheet.mergeCells('E7:F7');
    worksheet.getCell('E7').value = "?????????????????????????????????????????? :";
    worksheet.getCell('E7').alignment = { horizontal: 'right' };
    worksheet.getCell('E7').font = {
        bold: true
    }

    worksheet.mergeCells('G7:I7');
    worksheet.getCell('G7').value = "???...................................................................";
    worksheet.getCell('G7').alignment = { horizontal: 'center' };
    worksheet.getCell('G7').font = {
        bold: true
    }

    worksheet.mergeCells('A8:B8');
    worksheet.getCell('A8').value = "???????????????????????????????????????????????? :";
    worksheet.getCell('A8').alignment = { horizontal: 'left' };
    worksheet.getCell('A8').font = {
        bold: true
    }

    worksheet.mergeCells('C8:I8');
    worksheet.getCell('C8').value = purpose;
    worksheet.getCell('C8').alignment = { vertical: 'top', horizontal: 'left' };

    worksheet.mergeCells('A9:B9');
    worksheet.getCell('A9').value = "??????????????????????????????????????????????????? :";
    worksheet.getCell('A9').alignment = { horizontal: 'left' };
    worksheet.getCell('A9').font = {
        bold: true
    }

    worksheet.mergeCells('C9:I9');
    worksheet.getCell('C9').value = dateBackExcel;
    worksheet.getCell('C9').alignment = { horizontal: 'left' };

    worksheet.mergeCells('A10:B10');
    worksheet.getCell('A10').value = "????????????????????????????????????????????? :";
    worksheet.getCell('A10').alignment = { horizontal: 'left' };
    worksheet.getCell('A10').font = {
        bold: true
    }

    worksheet.mergeCells('C10:D10');
    worksheet.getCell('C10').value = "( ) ???????????????????????????????????????";
    worksheet.getCell('C10').alignment = { horizontal: 'center' };

    worksheet.mergeCells('E10:I10');
    worksheet.getCell('E10').value = "( ) ????????????????????????????????????  ???????????????????????????????????????????????? ???........./???........./???.........";
    worksheet.getCell('E10').alignment = { horizontal: 'center' };

    // Table tools
    // Header //
    worksheet.getCell('A11').value = "???????????????";
    worksheet.getCell('A11').alignment = { horizontal: 'center' };
    worksheet.getCell('A11').font = {
        bold: true
    }
    worksheet.getCell('A11').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    worksheet.mergeCells('B11:G11');
    worksheet.getCell('B11').value = "???????????????????????????????????????";
    worksheet.getCell('B11').alignment = { horizontal: 'center' };
    worksheet.getCell('B11').font = {
        bold: true
    }
    worksheet.getCell('B11').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    worksheet.mergeCells('H11:I11');
    worksheet.getCell('H11').value = "???????????????";
    worksheet.getCell('H11').alignment = { horizontal: 'center' };
    worksheet.getCell('H11').font = {
        bold: true
    }
    worksheet.getCell('H11').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    //
    // Table body
    var row = 12;
    var rowCount = 0;
    for (i = 0; i <= 4; i++) {
        rowCount++;
        // ???????????????
        worksheet.getCell('A' + row).alignment = { horizontal: 'center' };
        worksheet.getCell('A' + row).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        //???????????????????????????????????????
        var cellTools = 'B' + row + ":" + 'G' + row;
        worksheet.mergeCells(cellTools);
        worksheet.getCell(cellTools).alignment = { horizontal: 'center' };
        worksheet.getCell(cellTools).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        //???????????????
        var cellNumberTools = 'H' + row + ":" + 'I' + row;
        worksheet.mergeCells(cellNumberTools);
        worksheet.getCell(cellNumberTools).alignment = { horizontal: 'center' };
        worksheet.getCell(cellNumberTools).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        if (toolExcel[i] != "" && toolNumberExcel[i] != "") {
            worksheet.getCell('A' + row).value = rowCount;
            worksheet.getCell('B' + row).value = toolExcel[i];
            worksheet.getCell('H' + row).value = toolNumberExcel[i];
        }
        row++;
    }
    //

    worksheet.mergeCells('A18:I18');
    worksheet.getCell('A18').value = "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????";
    worksheet.getCell('A18').alignment = { horizontal: 'center' };

    // Table
    worksheet.mergeCells('A19:I19');
    worksheet.getCell('A19').value = "????????????????????????????????????????????????????????????";
    worksheet.getCell('A19').alignment = { horizontal: 'center' };
    worksheet.getCell('A19').font = {
        bold: true
    }
    worksheet.getCell('A19').fill = {
        type: 'pattern',
        pattern: 'darkVertical',
        fgColor: { argb: 'FAFAD2' }
    }
    worksheet.getCell('A19').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    worksheet.mergeCells('A20:D20');
    worksheet.getCell('A20').value = "??????????????????";
    worksheet.getCell('A20').alignment = { horizontal: 'center' };
    worksheet.getCell('A20').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F20:I20');
    worksheet.getCell('F20').value = "??????????????????";
    worksheet.getCell('F20').alignment = { horizontal: 'center' };
    worksheet.getCell('F20').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A21:D21');
    worksheet.getCell('A21').value = "(???..................................................................)";
    worksheet.getCell('A21').alignment = { horizontal: 'center' };
    worksheet.getCell('A21').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F21:I21');
    worksheet.getCell('F21').value = "(???..................................................................)";
    worksheet.getCell('F21').alignment = { horizontal: 'center' };
    worksheet.getCell('F21').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A22:D22');
    worksheet.getCell('A22').value = dateBorrowExcel;
    worksheet.getCell('A22').alignment = { horizontal: 'center' };
    worksheet.getCell('A22').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F22:I22');
    worksheet.getCell('F22').value = dateBorrowExcel;
    worksheet.getCell('F22').alignment = { horizontal: 'center' };
    worksheet.getCell('F22').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A23:D23');
    worksheet.getCell('A23').value = "???????????????????????????????????????";
    worksheet.getCell('A23').alignment = { horizontal: 'center' };
    worksheet.getCell('A23').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F23:I23');
    worksheet.getCell('F23').value = "?????????????????????????????????????????????????????????????????????????????????";
    worksheet.getCell('F23').alignment = { horizontal: 'center' };
    worksheet.getCell('F23').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A24:I24');
    worksheet.getCell('A24').border = {
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    //

    worksheet.mergeCells('A26:I26');
    worksheet.getCell('A26').value = "????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????";
    worksheet.getCell('A26').alignment = { horizontal: 'center' };

    // Table
    worksheet.mergeCells('A27:I27');
    worksheet.getCell('A27').value = "?????????????????????????????????????????????????????????????????????";
    worksheet.getCell('A27').alignment = { horizontal: 'center' };
    worksheet.getCell('A27').font = {
        bold: true
    }
    worksheet.getCell('A27').fill = {
        type: 'pattern',
        pattern: 'darkVertical',
        fgColor: { argb: 'FAFAD2' }
    }
    worksheet.getCell('A27').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    worksheet.mergeCells('A28:D28');
    worksheet.getCell('A28').value = "??????????????????";
    worksheet.getCell('A28').alignment = { horizontal: 'center' };
    worksheet.getCell('A28').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F28:I28');
    worksheet.getCell('F28').value = "??????????????????";
    worksheet.getCell('F28').alignment = { horizontal: 'center' };
    worksheet.getCell('F28').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A29:D29');
    worksheet.getCell('A29').value = "(???..................................................................)";
    worksheet.getCell('A29').alignment = { horizontal: 'center' };
    worksheet.getCell('A29').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F29:I29');
    worksheet.getCell('F29').value = "(???..................................................................)";
    worksheet.getCell('F29').alignment = { horizontal: 'center' };
    worksheet.getCell('F29').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A30:D30');
    worksheet.getCell('A30').value = dateBackExcel;
    worksheet.getCell('A30').alignment = { horizontal: 'center' };
    worksheet.getCell('A30').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F30:I30');
    worksheet.getCell('F30').value = dateBackExcel;
    worksheet.getCell('F30').alignment = { horizontal: 'center' };
    worksheet.getCell('F30').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A31:D31');
    worksheet.getCell('A31').value = "????????????????????????????????????????????????";
    worksheet.getCell('A31').alignment = { horizontal: 'center' };
    worksheet.getCell('A31').border = {
        left: { style: 'thin' },
    };

    worksheet.mergeCells('F31:I31');
    worksheet.getCell('F31').value = "?????????????????????????????????????????????????????????????????????????????????";
    worksheet.getCell('F31').alignment = { horizontal: 'center' };
    worksheet.getCell('F31').border = {
        right: { style: 'thin' },
    };

    worksheet.mergeCells('A32:I32');
    worksheet.getCell('A32').border = {
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    //

    // Save
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'APPOINTMENT_????????????????????????????????????-?????????_' + nameStudent + '.xlsx');
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