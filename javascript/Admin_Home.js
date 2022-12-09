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

let allTeacher = 0;
let allManage = 0;
let allStudent = 0;

function requestData() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var user = firebase.auth().currentUser;
            if (user) {
                // blockUI();
                var Role = getCookie('Role');

                if (name != "") {
                    // ยิง API
                    $.ajax({
                        url: "https://us-central1-appointment-c8cfd.cloudfunctions.net/API/dash",
                        type: "POST",
                        data: {
                            'time': "today",
                            'role': Role,
                        },
                        success: function (data) {
                            // unBlockUI();
                            if (data) {
                                allTeacher = data.allTea;
                                allManage = data.allMa + data.allSer;
                                allStudent = data.allStu;
                                $('#dash_all_user').html(data.allTea + data.allMa + data.allSer + data.allStu);
                                $('#dash_all_teacher').html(data.allTea);
                                $('#dash_all_manage').html(data.allMa + data.allSer);
                                $('#dash_all_student').html(data.allStu);
                                runNumberDashboard();
                            } else {
                                Swal.fire({
                                    type: 'error',
                                    title: 'ERROR',
                                    text: 'Error !',
                                    confirmButtonText: '<i class="fa fa-times"></i> ตกลง',
                                }).then(function () {
                                    RequestCountAppointment();
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

function runNumberDashboard() {
    $(".dash_value").fadeIn(500);
    $('.counter-count').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 1500,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });

    // Charts
    // Themes begin
    am4core.useTheme(am4themes_material);
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create("myChart", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = [
        {
            country: "อาจารย์",
            litres: allTeacher,
        },
        {
            country: "เจ้าหน้าที่",
            litres: allManage,
        },
        {
            country: "นักศึกษา",
            litres: allStudent,
        },
    ];

    chart.innerRadius = am4core.percent(40);
    chart.depth = 120;

    chart.legend = new am4charts.Legend();

    var series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "litres";
    series.dataFields.depthValue = "litres";
    series.dataFields.category = "country";
    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;
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