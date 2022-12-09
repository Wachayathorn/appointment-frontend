function submitLogout() {
    firebase.auth().signOut().then(function () {
        window.location.href = "/index.html";
    }).catch(function (error) {
        console.log("Logout error !");
    })
}