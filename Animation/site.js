var fadersLeft = document.querySelectorAll(".fade-left");
var fadersRight = document.querySelectorAll(".fade-right");
var faderIn = document.querySelectorAll(".fadein");
var fadeCount = document.querySelectorAll(".fadecount");
var interval = 1000;

var appearOptions = {
    threshold: 0,
    rootMargin: "0px 0px -100px 0px"
};

var appearScroll = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("_appear");
            appearScroll.unobserve(entry.target);
        }
    });
}, appearOptions);

if (fadersLeft) {
    fadersLeft.forEach(function(element) {
        appearScroll.observe(element);
    });
}

if (fadersRight) {
    fadersRight.forEach(function(element) {
        appearScroll.observe(element);
    });
}

if (faderIn) {
    faderIn.forEach(function(element) {
        appearScroll.observe(element);
    });
}

if (fadeCount) {
    fadeCount.forEach(function(element) {
        appearScroll.observe(element);
    });
}
