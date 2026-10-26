/* Whitted's deterministic specular ray tree, before the integrator comparison. */
module.exports=function(data){
 const topics=data.p04.topics,i=topics.findIndex(t=>t.id==='slide-20');if(i<0)throw Error('Missing Whitted topic');
 const references=[{title:'Whitted (1980): An Improved Illumination Model for Shaded Display',url:'https://doi.org/10.1145/358876.358882'},{title:'PBRT: Whittedův integrátor',url:'https://pbr-book.org/3ed-2018/Introduction/pbrt_System_Overview#AnIntegratorforWhittedRayTracing'}];
 Object.assign(topics[i],{title:'Whitted: strom paprsků',pages:[68,69],points:[
  'Primární paprsek: z kamery k nejbližšímu zásahu. Určíme materiál, emisi a přímé osvětlení.',
  'Stínový paprsek: je zdroj viditelný? Pro neprůsvitné překážky stačí any-hit mezi zásah a světlo, bez rekurze.',
  'Odraz a lom: nové paprsky hledají další zásahy. U ideálního zrcadla či skla tak vzniká rekurzivní strom.'
 ],callouts:[{kind:'definition',title:'Směr výpočtu',text:'Strom rozvíjíme od kamery do scény. Vypočtené příspěvky pak skládáme zpět ke kameře, proti směru vyslaných paprsků.'}],references});
 topics.splice(i+1,0,{id:'whitted-recursion',title:'Whitted: skládání příspěvků a ukončení',pages:[70,71],points:[
  'C je lineární RGB před zobrazením, d aktuální hloubka rekurze.',
  'Fresnelův jev a materiál určují váhy wᵣ, wₜ. Při úplném vnitřním odrazu lom chybí.',
  'Minutí scény vrátí pozadí. Hloubka D zastaví další větvení i mezi dvěma zrcadly. Příliš malé D obraz ochudí.'
 ],equations:[{label:'Lokální příspěvek + vážené výsledky odražené a lomené větve',text:'C_d = C_local + w_r C_r,d+1 + w_t C_t,d+1'}],callouts:[{kind:'note',title:'Omezení',text:'Obecné difuzní nepřímé osvětlení: červená stěna sama neobarví bílý sousední povrch. Ideální odrazy a průhledy přitom mohou být vícenásobné.'}],questions:[
  {question:'Podrobnosti: lokální člen, konec větve a měkké stíny',answer:'Lokální příspěvek zahrnuje emisi a přímé osvětlení po testech viditelnosti, například z Phongova modelu. U difuzního materiálu bez ideální odrazivé a transmisní složky dál nerekurzujeme. Na hloubce D také počítáme lokální člen, ale další větve už nevysíláme. Váhy zahrnují materiálovou odezvu. Při fyzikálním transportu radiance lomem patří do transmisní váhy i faktor indexů lomu, nikoli jen 1−F. Plošné světlo vzorkujeme více stínovými paprsky: částečná viditelnost vytváří měkký stín, nikoli difuzní nepřímé osvětlení.'}
 ],references:[...references,{title:'Vyzkoušet tři integrátory',url:'#integrator-lab'}]});
 return data;
};
