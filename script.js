
document.addEventListener("DOMContentLoaded", function() {
    var header = document.querySelector('.header');
    var headerHeight = header.offsetHeight;
    var contentSection = document.querySelector('.content').offsetTop;

    window.addEventListener("scroll", function() {
        var scrollPosition = window.scrollY;

        if (scrollPosition > headerHeight) {
            header.classList.add('fixed');
        } else {
            header.classList.remove('fixed');
        }
    });
});

var toggles= document.querySelectorAll(".work-title");

toggles.forEach(function(toggle){

    toggle.addEventListener("click",function(){
        toggle.classList.toggle("_open");
    })

});



document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll(".project-filter button");
    const projects = document.querySelectorAll(".project-cards a");

    buttons.forEach(button => {
        button.addEventListener("click", function() {
            const category = this.getAttribute("data-filter");
            filterProjects(category);
        });
    });

    function filterProjects(category) {
        projects.forEach(project => {
            const categories = project.getAttribute("data-category").split(" ");
            if (category === "all" || categories.includes(category)) {
                project.style.display = "block";
            } else {
                project.style.display = "none";
            }
        });
    }
});

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
