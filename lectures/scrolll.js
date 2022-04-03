const delta = 20;

function scroll(element, start, stop, current) {

    let dir = Math.sign(stop - start);
    current += dir * delta;
    element.scrollLeft = current;

    if (dir < 0)
        current = Math.max(stop, current);
    else 
        current = Math.min(stop, current);  

    if (current != stop)
        setTimeout(scroll, 5, element, start, stop, current);
}

function setScroll() {
    let meet = document.getElementById("meetings-title");

    let before = document.createElement("span");
    before.classList.add("navigation");
    before.innerHTML = '&larr; Multimedia and';
    let after = document.createElement("span");
    after.classList.add("navigation");
    after.innerHTML = ' Graphics Applications &rarr;';

    meet.innerHTML = '';
    meet.prepend(before);
    meet.append(after);

    let meetings = document.getElementById("meetings");
    let meeting = document.getElementsByClassName("meeting");
    let w = meeting[0].offsetWidth;
    let max = meetings.scrollWidth;
    meetings.scrollLeft = max;
    
    before.onclick = () => {
        console.log(w, max, meetings.scrollLeft);
        let end = Math.max(0, meetings.scrollLeft - w);
        scroll(meetings, meetings.scrollLeft, end, meetings.scrollLeft)
    }
    
    after.onclick = () => {
        console.log(w, max, meetings.scrollLeft);
        let end = Math.min(max, meetings.scrollLeft + w);
        scroll(meetings, meetings.scrollLeft, end, meetings.scrollLeft)
    }
    
}
