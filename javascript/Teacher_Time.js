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

function getTimetable(i) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var uID = getCookie('uID');
                var nameteacher = getCookie('User');
                var role = getCookie('Role');
                if (i == null) {
                    document.getElementById("user_login").innerHTML = nameteacher;
                    var sp_startdate = moment().startOf('week').add('days', 1).format("ddd, DD/MM/YYYY") + "  -  " + moment().startOf('week').add('days', 5).format("ddd, DD/MM/YYYY")
                    document.getElementById('sp_currentweek').innerHTML = sp_startdate;
                }
                // User is signed in.
                if (uID != "") {
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestTimetable",
                        type: "POST",
                        data: {
                            'uID': uID,
                            'role': role,
                        },
                        success: function (data) {
                            if (data) {
                                if (data.Timetable) {
                                    var allTimetable = data.Timetable;
                                    setTimetable(allTimetable);
                                }
                            } else {
                                Swal.fire({
                                    type: 'error',
                                    title: 'ERROR',
                                    text: 'Error !',
                                    confirmButtonText: '<i class="fa fa-times"></i> ????????????',
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

function setTimetable(allTime) {
    var getCountId = 0;
    var arrayDetail = [];
    var dayID = ["montime", "thutime", "wedtime", "fritime", "tuetime"];
    var arrayGetID = ["9", "10", "11", "12", "13", "14", "15", "16", "17"];
    var time = ["9:00 ??? - 9:15 ???", "9:15 ??? - 9:30 ???", "9:30 ??? - 9:45 ???", "9:45 ??? - 10:00 ???",
        "10:00 ??? - 10:15 ???", "10:15 ??? - 10:30 ???", "10:30 ??? - 10:45 ???", "10:45 ??? - 11:00 ???",
        "11:00 ??? - 11:15 ???", "11:15 ??? - 11:30 ???", "11:30 ??? - 11:45 ???", "11:45 ??? - 12:00 ???",
        "12:00 ??? - 12:15 ???", "12:15 ??? - 12:30 ???", "12:30 ??? - 12:45 ???", "12:45 ??? - 13:00 ???",
        "13:00 ??? - 13:15 ???", "13:15 ??? - 13:30 ???", "13:30 ??? - 13:45 ???", "13:45 ??? - 14:00 ???",
        "14:00 ??? - 14:15 ???", "14:15 ??? - 14:30 ???", "14:30 ??? - 14:45 ???", "14:45 ??? - 15:00 ???",
        "15:00 ??? - 15:15 ???", "15:15 ??? - 15:30 ???", "15:30 ??? - 15:45 ???", "15:45 ??? - 16:00 ???",
        "16:00 ??? - 16:15 ???", "16:15 ??? - 16:30 ???", "16:30 ??? - 16:45 ???", "16:45 ??? - 17:00 ???",
        "17:00 ??? - 17:15 ???", "17:15 ??? - 17:30 ???", "17:30 ??? - 17:45 ???", "17:45 ??? - 18:00 ???"];
    // ?????????
    for (var i = 0; i < allTime.length; i++) {
        // ????????????????????????
        for (j = 0; j < 36; j++) {
            arrayDetail.push(allTime[i][time[j]]);
            if (arrayDetail.length == 4) {
                if ((arrayDetail[0] == null || arrayDetail[0] == false) || (arrayDetail[1] == null || arrayDetail[1] == false) || (arrayDetail[2] == null || arrayDetail[2] == false) || (arrayDetail[3] == null || arrayDetail[3] == false)) {
                    document.getElementById(dayID[i] + arrayGetID[getCountId]).className = "freetime";
                    getCountId++;
                    arrayDetail = [];
                } else {
                    document.getElementById(dayID[i] + arrayGetID[getCountId]).className = "nofreetime";
                    getCountId++;
                    arrayDetail = [];
                }
            }
        }
        getCountId = 0;
    }
}

function updateNoFreeTime(day, time) {
    var uID = getCookie('uID');
    var role = getCookie('Role');
    // User is signed in.
    if (uID != "") {
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/updateTimetable",
            type: "POST",
            data: {
                'uID': uID,
                'role': role,
                'day': day,
                'time': time,
                'status': "nofree",
            },
            success: function (data) {
                if (data) {
                    unBlockUI();
                    Swal.fire({
                        type: 'success',
                        title: 'SUCCESS',
                        text: '????????????????????????????????????????????????',
                        confirmButtonText: '<i class="fa fa-check"></i> ????????????',
                    }).then(function () {
                        getTimetable(i = 1);
                    })
                } else {
                    Swal.fire({
                        type: 'error',
                        title: 'ERROR',
                        text: 'Error !',
                        confirmButtonText: '<i class="fa fa-times"></i> ????????????',
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

function updateFreeTime(day, time) {
    var uID = getCookie('uID');
    var role = getCookie('Role');
    // User is signed in.
    if (uID != "") {
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/updateTimetable",
            type: "POST",
            data: {
                'uID': uID,
                'role': role,
                'day': day,
                'time': time,
                'status': "free",
            },
            success: function (data) {
                if (data) {
                    unBlockUI();
                    Swal.fire({
                        type: 'success',
                        title: 'SUCCESS',
                        text: '????????????????????????????????????????????????',
                        confirmButtonText: '<i class="fa fa-check"></i> ????????????',
                    }).then(function () {
                        getTimetable(i = 1);
                    })
                } else {
                    Swal.fire({
                        type: 'error',
                        title: 'ERROR',
                        text: 'Error !',
                        confirmButtonText: '<i class="fa fa-times"></i> ????????????',
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