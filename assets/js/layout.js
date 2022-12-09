$(document).ready(function () {
    $('[data-class]').click(function () {
        updateNavbarClass($(this).attr('data-class'));
    });

    var width = $(window).width();
    if (width < 768) {
        $('.content').css({ 'margin-left': '30px' });
    } else {
        $('.content').css({ 'margin-left': '282px' });
    }
    updateNavbarClass('fixed-left');
});

function updateNavbarClass(className) {
    $('nav')
        .removeClass(function (index, css) {
            return (css.match(/(^|\s)fixed-\S+/g) || []).join(' ');
        })
        .addClass(className);

    $('[data-class]').removeClass('active').parent('li').removeClass('active');
    $('[data-class="' + className + '"]').addClass('active').parent('li').addClass('active');

    fixBodyMargin(className);
}

function fixBodyMargin(className) {
    if (/fixed-(left|right)/.test(className)) {
        $('body').removeAttr('style');
        if (className === 'fixed-right') {
            $('body').css('marginLeft', 0);
        } else {
            $('body').css('marginRight', 0);
        }
    } else {
        $('body').css({
            "margin-right": 0,
            "margin-left": 0,
            "padding-top": '90px'
        });
    }
}

function jqUpdateSize() {
    var width = $(window).width();
    if (width < 768) {
        $('.content').css({ 'margin-left': '30px' });
    } else {
        $('.content').css({ 'margin-left': '282px' });
    }
}
