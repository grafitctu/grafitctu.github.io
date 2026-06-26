function test(){ fetch('characters.json').then(r=>r.json()).then(data=>console.log(data.length)); }
