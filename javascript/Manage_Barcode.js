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

var maxSet;
function checkAuth() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var role = getCookie('Role');
                var name = getCookie('User');
                document.getElementById("user_login").innerHTML = name;
                $.ajax({
                    url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestSetBarcode",
                    type: "POST",
                    data: {
                        'role': role,
                    },
                    success: function (data) {
                        if (data) {
                            $('#sl_set').empty();
                            var dd_search_name = document.getElementById('sl_set');
                            var optionNull = document.createElement('option');
                            optionNull.value = "";
                            dd_search_name.add(optionNull, 1);
                            var arraySet = [];
                            for (i = 0; i < data["Data"].length; i++) {
                                arraySet.push(parseInt(data["Data"][i]["set"]));
                            }
                            var allSet = arraySet.filter(onlyUnique);
                            allSet.sort();
                            maxSet = Math.max.apply(Math, allSet);
                            for (j = 0; j < allSet.length; j++) {
                                var option = document.createElement('option');
                                option.text = "บาร์โค้ดชุดที่ " + allSet[j];
                                option.value = allSet[j];
                                dd_search_name.add(option, 1);
                            }
                        } else {
                            Swal.fire({
                                type: 'error',
                                title: 'ERROR',
                                text: 'Error !',
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
                window.location.href = "/index.html";
            }
        }
    });
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function submitCreateBarcode() {
    var user = firebase.auth().currentUser;
    if (user) {
        blockUILoading();
        var allBarcode = [];
        var name = getCookie('User');
        var role = getCookie('Role');
        var today = new Date();
        var dateNow = today.getDate();
        if (dateNow < 10) {
            dateNow = "0" + today.getDate().toString();
        }
        var monthNow = today.getMonth() + 1;
        if (monthNow < 10) {
            monthNow = "0" + (today.getMonth() + 1).toString();
        }
        for (var i = 1; i <= 50; i++) {
            if (i < 10) {
                var barcode_data = dateNow + "-" + monthNow + "-" + today.getFullYear().toString() + "-" + "0" + i;
            } else {
                var barcode_data = dateNow + "-" + monthNow + "-" + today.getFullYear().toString() + "-" + i;
            }

            var create_time = today.getTime() + i;
            var obj = {
                'data': barcode_data,
                'create_time': create_time,
            }
            allBarcode.push(obj);
        }
        setTimeout(function () {
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/createBarcode",
                type: "POST",
                data: {
                    'set': maxSet.toString() === "-Infinity" ? "1" : maxSet + 1,
                    'role': role,
                    'data': allBarcode,
                },
                success: function (data) {
                    if (data) {
                        console.log("Create success");
                    } else {
                        Swal.fire({
                            type: 'error',
                            title: 'ERROR',
                            text: 'Error !',
                            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                        })
                    }
                },
                error: function (xhr, status, error) {
                    console.log('Error: ' + error.message);
                },
            });
        }, 500);
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

function RequestBarcode(set) {
    table.clear().draw();
    var user = firebase.auth().currentUser;
    if (user) {
        var role = getCookie('Role');
        $.ajax({
            url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/requestBarcode",
            type: "POST",
            data: {
                'set': set,
                'role': role,
            },
            success: function (data) {
                if (data) {
                    if (data.allBarcode) {
                        var allBarcode = data.allBarcode;
                        for (var i = 0; i < allBarcode.length; i++) {
                            initDatatable(allBarcode[i]);
                        }
                    }
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            },
        });
    }
};

function initDatatable(doc) {
    var count = doc.data.substring(11);
    var _BARCODE = doc.data;
    var initData = [];
    initData.push(doc.id);
    initData.push(doc.data);
    table.row.add(['<input type="checkbox" class="checkbox-datatable" value="' + initData + '">', count, doc.data, '<svg id="' + doc.id + '" class="barcode"></svg>']).draw();
    $("#" + doc.id).JsBarcode(_BARCODE, { format: "CODE128" });
}

function deleteBarcode() {
    var rowcollection = table.$(".checkbox-datatable:checked", { "page": "all" });
    if (rowcollection.length == 0) {
        Swal.fire({
            type: 'error',
            title: 'ERROR',
            text: 'กรุณาเลือกบาร์โค้ดที่ต้องการลบ !',
            confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
        })
    } else {
        blockUI();
        var role = getCookie('Role');
        var arrayBarcodeId = [];
        var countRow = 0;
        rowcollection.each(function (i, e) {
            countRow++;
            var _barcodeID = $(e).val().split(',');
            arrayBarcodeId.push(_barcodeID[0]);
        })

        setTimeout(function () {
            $.ajax({
                url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/deleteBarcode",
                type: "POST",
                data: {
                    'role': role,
                    'arrayID': arrayBarcodeId,
                },
                success: function (data) {
                    if (data) {
                        unBlockUI();
                        Swal.fire({
                            type: 'success',
                            title: 'SUCCESS',
                            text: 'ลบบาร์โค้ดที่เลือกสำเร็จ',
                            confirmButtonText: '<i class="fa fa-check"></i> ตกลง',
                        }).then(function () {
                            // $('[name=select_all]').prop('checked', false);
                            // table.clear().draw();
                            // $('#sl_set').empty();
                            // checkAuth();
                            location.reload();
                        })
                    }
                },
                error: function (xhr, status, error) {
                    console.log('Error: ' + error.message);
                },
            });
        }, 500);
    }
}

function blockUILoading() {
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
                text: 'สร้างบาร์โค้ดสำเร็จ',
                showConfirmButton: false,
                timer: 2000,
            }).then(function () {
                table.clear().draw();
                location.reload();
            })
        }
    }, 100);
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
