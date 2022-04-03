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
    
    <!--- --->

    let meet4 = document.getElementById("meetings-title4");
    let before4 = document.createElement("span");
    before4.classList.add("navigation");
    before4.innerHTML = '&larr; Modern Vis';
    let after4 = document.createElement("span");
    after4.classList.add("navigation");
    after4.innerHTML = 'ualisation Technologies &rarr;';
    meet4.innerHTML = '';
    meet4.prepend(before4);
    meet4.append(after4);
    
    <!--- --->

    let meet3 = document.getElementById("meetings-title3");
    let before3 = document.createElement("span");
    before3.classList.add("navigation");
    before3.innerHTML = '&larr; Virtual Gam';
    let after3 = document.createElement("span");
    after3.classList.add("navigation");
    after3.innerHTML = 'ing Worlds &rarr;';
    meet3.innerHTML = '';
    meet3.prepend(before3);
    meet3.append(after3);
    
    <!--- --->

    let meet9 = document.getElementById("meetings-title9");
    let before9 = document.createElement("span");
    before9.classList.add("navigation");
    before9.innerHTML = '&larr; Creative Coding and ';
    let after9 = document.createElement("span");
    after9.classList.add("navigation");
    after9.innerHTML = 'Comitational Arts &rarr;';
    meet9.innerHTML = '';
    meet9.prepend(before9);
    meet9.append(after9);
    
    <!--- --->

    let meet5 = document.getElementById("meetings-title5");
    let before5 = document.createElement("span");
    before5.classList.add("navigation");
    before5.innerHTML = '&larr; Architecture of';
    let after5 = document.createElement("span");
    after5.classList.add("navigation");
    after5.innerHTML = 'Computer Games &rarr;';
    meet5.innerHTML = '';
    meet5.prepend(before5);
    meet5.append(after5);
    
    <!--- --->

    let meet6 = document.getElementById("meetings-title6");
    let before6 = document.createElement("span");
    before6.classList.add("navigation");
    before6.innerHTML = '&larr; Pattern ';
    let after6 = document.createElement("span");
    after6.classList.add("navigation");
    after6.innerHTML = 'Recognition &rarr;';
    meet6.innerHTML = '';
    meet6.prepend(before6);
    meet6.append(after6);
    
    <!--- --->

    let meet7 = document.getElementById("meetings-title7");
    let before7 = document.createElement("span");
    before7.classList.add("navigation");
    before7.innerHTML = '&larr; Advanced Vir';
    let after7 = document.createElement("span");
    after7.classList.add("navigation");
    after7.innerHTML = 'tual Reality &rarr;';
    meet7.innerHTML = '';
    meet7.prepend(before7);
    meet7.append(after7);    
    
    <!--- --->

    let meet8 = document.getElementById("meetings-title8");
    let before8 = document.createElement("span");
    before8.classList.add("navigation");
    before8.innerHTML = '&larr; Computer ';
    let after8 = document.createElement("span");
    after8.classList.add("navigation");
    after8.innerHTML = 'Graphics 1 &rarr;';
    meet8.innerHTML = '';
    meet8.prepend(before8);
    meet8.append(after8); 

    

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
