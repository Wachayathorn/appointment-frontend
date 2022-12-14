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
    table.row.add([count, toolsArray, doc.name, '<img class="table-image" src="/assets/images/accept.png" style="width : 45px; height:45px;">', doc.date, '<button type="button" class="btn btn-orange" value="' + doc.note_ID + '"  onclick="processBorrow(this.value)">??????????????????????????????</button>', doc.student_ID, doc.teacher, doc.note_ID, doc.time, doc.topic, doc.status, doc.day, doc.dateBack, NumberArray, doc.section, doc.advisorName]).draw();
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
    return '<h5 style="margin-top:10px;"><b>?????????????????? : </b>' + obj["Topic"] + '</h5>' + '<p><b>???????????? : </b>' + obj["Name"] + '<b style="margin-left:10px;">???????????????????????????????????? : </b>' + obj["Student_ID"] + '<p><b>??????????????? : </b>' + obj["Section"] + '<b style="margin-left:10px;">???????????????????????????????????????????????? : </b>' + obj["Advisor"] + '</p>' + '</p>' + '<p><b>????????????????????? : </b>' + obj["Teacher"] + '</p>' + '<p><b>????????? : </b>' + obj["Day"] + '<b style="margin-left:10px;">?????????????????? : </b>' + obj["Date"] + '</p>' + '<p><b>???????????? : </b>' + obj["Time"] + '</p>' + '<p><b>????????????????????????????????????????????? : </b>' + obj["Tool"] + '</p>' + '<p><b>??????????????? : </b>' + obj["Num"] + '</p>' + '<p><b>???????????????????????????????????????????????? : </b>' + obj["DateBack"] + '</p>' + '<p><b>??????????????? : </b>' + obj["Status"] + '</p>';
}

function processBorrow(note) {
    blockUI();
    var role = getCookie('Role');
    $.ajax({
        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/process",
        type: "POST",
        data: {
            'role': role,
            'note_id': note,
        },
        success: function (data) {
            if (data) {
                unBlockUI();
                Swal.fire({
                    type: 'success',
                    title: 'SUCCESS',
                    text: '??????????????????????????????',
                    confirmButtonText: '<i class="fa fa-check"></i> ????????????',
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