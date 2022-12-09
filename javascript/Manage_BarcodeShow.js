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

function barcodeShow() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                var name = getCookie('User');
                if (name != "") {
                    var nowURL = window.location.href;
                    var index = nowURL.indexOf('?') + 1;
                    var _barcode = nowURL.substring(index);
                    var _arrayBarcode = _barcode.split(',');
                    for (i = 0; i < _arrayBarcode.length; i++) {
                        renderLsit(_arrayBarcode[i]);
                    }
                    setTimeout(function () {
                        window.print();
                    }, 1000);
                }
                else {
                    console.log("User is null");
                }
            }
        } else {
            // No user is signed in.
            console.log("No user signed in");
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

function renderLsit(doc) {
    var checkZero = doc.substring(11, 12);
    if (checkZero == 0) {
        var count = doc.substring(12);
    } else {
        var count = doc.substring(11);
    }
    var bar_id = "bar_" + count;

    var table = document.getElementById('table_show_barcode').getElementsByTagName('tbody')[0];
    var row = table.insertRow();

    var newBarcode = row.insertCell(0);


    var _Barcode = document.createElement(_Barcode);
    _Barcode.innerHTML = '<svg id="' + bar_id + '" class="barcode"></svg>';

    newBarcode.appendChild(_Barcode);

    drawBarcode(bar_id, doc);
}

function drawBarcode(bar_id, _BARCODE) {
    $("#" + bar_id).JsBarcode(_BARCODE, { format: "CODE128" });
}