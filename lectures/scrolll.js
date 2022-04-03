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
    let meet2 = document.getElementById("meetings-title2");

    let before = document.createElement("span");
    before.classList.add("navigation");
    before.innerHTML = '&larr; Multimedia and';
    let after = document.createElement("span");
    after.classList.add("navigation");
    after.innerHTML = ' Graphics Applications &rarr;';
    
    let before2 = document.createElement("span");
    before2.classList.add("navigation");
    before2.innerHTML = '&larr; xxxxxxxx';
    let after2 = document.createElement("span");
    after2.classList.add("navigation");
    after2.innerHTML = ' yyyyyyyyy &rarr;';

    meet.innerHTML = '';
    meet.prepend(before);
    meet.append(after);
    
    meet2.innerHTML = '';
    meet2.prepend(before2);
    meet2.append(after2);

    let meetings = document.getElementById("meetings");
    let meeting = document.getElementsByClassName("meeting");
    let w = meeting[0].offsetWidth;
    let max = meetings.scrollWidth;
    meetings.scrollLeft = max;
    
    let meetings2 = document.getElementById("meetings2");
    let meeting2 = document.getElementsByClassName("meeting");
    let w2 = meeting2[0].offsetWidth;
    let max2 = meetings2.scrollWidth;
    meetings2.scrollLeft = max;
    
    before.onclick = () => {
        console.log(w, max, meetings.scrollLeft);
        let end = Math.max(0, meetings.scrollLeft - w);
        scroll(meetings, meetings.scrollLeft, end, meetings.scrollLeft)
        
        console.log(w2, max2, meetings2.scrollLeft);
        let end2 = Math.max(0, meetings2.scrollLeft - w2);
        scroll(meetings2, meetings2.scrollLeft, end2, meetings2.scrollLeft)
    }
    
    after.onclick = () => {
        console.log(w, max, meetings.scrollLeft);
        let end = Math.min(max, meetings.scrollLeft + w);
        scroll(meetings, meetings.scrollLeft, end, meetings.scrollLeft)
        
        console.log(w2, max2, meetings2.scrollLeft);
        let end2 = Math.min(max2, meetings2.scrollLeft + w2);
        scroll(meetings2, meetings2.scrollLeft, end2, meetings2.scrollLeft)
    }
    
}
