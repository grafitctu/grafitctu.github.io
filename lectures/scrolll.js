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
    before.innerHTML = '&larr; Virtual Gam';
    let after = document.createElement("span");
    after.classList.add("navigation");
    after.innerHTML = 'ing Worlds &rarr;';
    
    let before2 = document.createElement("span");
    before2.classList.add("navigation");
    before2.innerHTML = '&larr; Programming of';
    let after2 = document.createElement("span");
    after2.classList.add("navigation");
    after2.innerHTML = ' Graphic Applications &rarr;';

    meet.innerHTML = '';
    meet.prepend(before);
    meet.append(after);
    
    meet2.innerHTML = '';
    meet2.prepend(before2);
    meet2.append(after2);
    
    <!--- --->

    let meet3 = document.getElementById("meetings-title3");
    let before3 = document.createElement("span");
    before3.classList.add("navigation");
    before3.innerHTML = '&larr; Modern Vis';
    let after3 = document.createElement("span");
    after3.classList.add("navigation");
    after3.innerHTML = 'ualisation Technologies &rarr;';
    meet3.innerHTML = '';
    meet3.prepend(before3);
    meet3.append(after3);


    

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
