/* W3Data ver 1.31 by W3Schools.com */
var w3DataObject = {};
function w3DisplayData(id, data) {
    var htmlObj, htmlTemplate, html, arr = [], a, l, rowClone, x, j, i, ii, cc, repeat, repeatObj, repeatX = "";
    htmlObj = document.getElementById(id);
    htmlTemplate = w3InitTemplate(id, htmlObj);
    html = htmlTemplate.cloneNode(true);
    arr = w3GetElementsByAttribute(html, "w3-repeat");
    l = arr.length;
    for (j = (l - 1); j >= 0; j -= 1) {
        cc = arr[j].getAttribute("w3-repeat").split(" ");
        if (cc.length == 1) {
            repeat = cc[0];
        } else {
            repeatX = cc[0];
            repeat = cc[2];
        }
        arr[j].removeAttribute("w3-repeat");
        repeatObj = data[repeat];
        if (repeatObj && typeof repeatObj == "object" && repeatObj.length != "undefined") {
            i = 0;
            for (x in repeatObj) {
                i += 1;
                rowClone = arr[j];
                rowClone = w3NeedleInHaystack(rowClone, "element", repeatX, repeatObj[x]);
                a = rowClone.attributes;
                for (ii = 0; ii < a.length; ii += 1) {
                    a[ii].value = w3NeedleInHaystack(a[ii], "attribute", repeatX, repeatObj[x]).value;
                }
                (i === repeatObj.length) ? arr[j].parentNode.replaceChild(rowClone, arr[j]) : arr[j].parentNode.insertBefore(rowClone, arr[j]);
            }
        } else {
            console.log("w3-repeat must be an array. " + repeat + " is not an array.");
            continue;
        }
    }
    html = w3NeedleInHaystack(html, "element");
    htmlObj.parentNode.replaceChild(html, htmlObj);
    function w3InitTemplate(id, obj) {
        var template;
        template = obj.cloneNode(true);
        if (w3DataObject.hasOwnProperty(id)) {return w3DataObject[id];}
        w3DataObject[id] = template;
        return template;
    }
    function w3GetElementsByAttribute(x, att) {
        var arr = [], arrCount = -1, i, l, y = x.getElementsByTagName("*"), z = att.toUpperCase();
        l = y.length;
        for (i = -1; i < l; i += 1) {
            if (i == -1) {y[i] = x;}
            if (y[i].getAttribute(z) !== null) {arrCount += 1; arr[arrCount] = y[i];}
        }
        return arr;
    }
    function w3NeedleInHaystack(elmnt, typ, repeatX, x) {
        var value, rowClone, pos1, haystack, pos2, needle = [], needleToReplace, i, cc, r;
        rowClone = elmnt.cloneNode(true);
        pos1 = 0;
        while (pos1 > -1) {
            haystack = (typ == "attribute") ? rowClone.value : rowClone.innerHTML;
            pos1 = haystack.indexOf("{{", pos1);
            if (pos1 === -1) {break;}
            pos2 = haystack.indexOf("}}", pos1 + 1);
            needleToReplace = haystack.substring(pos1 + 2, pos2);
            needle = needleToReplace.split("||");
            value = undefined;
            for (i = 0; i < needle.length; i += 1) {
                needle[i] = needle[i].replace(/^\s+|\s+$/gm, '');
                if (x) {value = x[needle[i]];}
                if (value == undefined && data) {value = data[needle[i]];}
                if (value == undefined) {
                    cc = needle[i].split(".");
                    if (cc[0] == repeatX) {value = x[cc[1]]; }
                }
                if (value == undefined) {
                    if (needle[i] == repeatX) {value = x;}
                }
                if (value == undefined) {
                    if (needle[i].substr(0, 1) == '"') {
                        value = needle[i].replace(/"/g, "");
                    } else if (needle[i].substr(0,1) == "'") {
                        value = needle[i].replace(/'/g, "");
                    }
                }
                if (value != undefined) {break;}
            }
            if (value != undefined) {
                r = "{{" + needleToReplace + "}}";
                if (typ == "attribute") {
                    rowClone.value = rowClone.value.replace(r, value);
                } else {
                    w3ReplaceHTML(rowClone, r, value);
                }
            }
            pos1 = pos1 + 1;
        }
        return rowClone;
    }
    function w3ReplaceHTML(a, r, result) {
        var b, l, i, a, x, j;
        if (a.hasAttributes()) {
            b = a.attributes;
            l = b.length;
            for (i = 0; i < l; i += 1) {
                if (b[i].value.indexOf(r) > -1) {b[i].value = b[i].value.replace(r, result);}
            }
        }
        x = a.getElementsByTagName("*");
        l = x.length;
        a.innerHTML = a.innerHTML.replace(r, result);
    }
}
function w3IncludeHTML(cb) {
  var z, i, elmnt, file, xhttp;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          elmnt.innerHTML = this.responseText;
          elmnt.removeAttribute("w3-include-html");
          w3IncludeHTML(cb);
        }
      }      
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
  }
  if (cb) cb();
}
function w3Http(target, readyfunc, xml, method) {
    var httpObj;
    if (!method) {method = "GET"; }
    if (window.XMLHttpRequest) {
        httpObj = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        httpObj = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (httpObj) {
        if (readyfunc) {httpObj.onreadystatechange = readyfunc;}
        httpObj.open(method, target, true);
        httpObj.send(xml);
    }
}
window.w3 = window.w3 || {};
window.w3.includeHTML = window.w3.includeHTML || w3IncludeHTML;
(function(){
function run(){
 if(!document.getElementById('games-grid')) return;
 var s=document.createElement('style');
 s.textContent='body.presentation-mode .promo-card--extra .promo-card__title{font-size:clamp(2.8rem,5.6vw,5.8rem)}';
 document.head.appendChild(s);
 function mt(el,t){if(!el)return;el.textContent='';t.split('\n').forEach(function(x,i){if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(x));});}
 function tags(el,a){if(!el)return;el.textContent='';a.forEach(function(x){var p=document.createElement('span');p.className='promo-card__tag';p.textContent=x;el.appendChild(p);});}
 function set(card,d){card.classList.add('promo-card--extra');card.dataset.qrTarget=d.href;card.dataset.qrTitle=d.title.replace(/\n/g,' ');var k=card.querySelector('.promo-card__kicker');if(k)k.textContent=d.kicker;mt(card.querySelector('.promo-card__title'),d.title);var x=card.querySelector('.promo-card__text');if(x)x.textContent=d.text;var y=card.querySelector('.promo-card__secondary');if(y)y.textContent=d.secondary;var img=card.querySelector('.promo-card__media img');if(img){img.src=d.image;img.alt=d.title.replace(/\n/g,' ');}tags(card.querySelector('.promo-card__tags'),d.tags);}
 var cards=Array.from(document.querySelectorAll('.promo-card'));
 var gj=cards.find(function(c){return ((c.querySelector('.promo-card__kicker')||{}).textContent||'').toLowerCase().indexOf('gamejam fit')>=0;});
 if(!gj || gj.dataset.splitDone) return; gj.dataset.splitDone='1';
 var art=gj.cloneNode(true); gj.parentNode.insertBefore(art,gj.nextSibling);
 set(gj,{kicker:'GameJam FIT · Development',title:'48 hours\nfrom idea to prototype',image:'/assets/games/promo-gamejam-development.jpg',href:'https://itch.io/jam/gamejam-fit-2025a',text:'For eight years, GameJam FIT has brought together students, teachers, alumni, sponsors and friends of the faculty to create playable games in a short, intense and playful format.',secondary:'Teams design mechanics, code prototypes, test ideas, present results and get feedback from teachers, peers, sponsors and people from the game industry.',tags:['48-hour prototypes','Teams','Sponsors','Feedback','Bohemia GameJam']});
 set(art,{kicker:'GameJam FIT · Game art',title:'From sketches\nto playable worlds',image:'/assets/games/promo-gamejam-art.jpg',href:'https://itch.io/jam/gamejam-fit-2025a',text:'GameJam is not only about programming. Students also build visual style, characters, worlds, UI, mood and readable game feedback under real time pressure.',secondary:'The specialization connects game design with visual creation — including digital drawing, concept art, animation, UX and practical work with game assets.',tags:['Digital Drawing','Game Art','Visual Design','UX','Student Creativity']});
 if(window.presentationSlides){presentationSlides.splice(presentationSlides.indexOf(gj)+1,0,art);} if(window.presentationInfoSlides){presentationInfoSlides.splice(presentationInfoSlides.indexOf(gj)+1,0,art);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
