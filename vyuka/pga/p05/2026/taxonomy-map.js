(()=>{'use strict';const root=document.querySelector('.taxonomy-map');if(!root)return;
const data={
grf:['GRF — General Reflectance Function','Obecná parametrizace knihy rozlišuje vstupní a výstupní polohu, čas, spektrum a směry, včetně samostatné transmise: 16 souřadnic. Není to NeRF.'],
bssrdf:['BSSRDF — vstup a výstup jsou různé body','S(xᵢ, ωᵢ; xₒ, ωₒ) propojuje dva body povrchu a dva směry. Osm souřadnic při pevné vlnové délce, devět se spektrem. U mramoru dovoluje šíření světla pod povrchem. Reflectance field může používat obdobné souřadnice na obálce celého objektu, není však stejnou doménou.'],
svbrdf:['SVBRDF — Spatially Varying BRDF','Každé místo má vlastní lokální BRDF. Šest souřadnic bez spektra. Stíny a zákryty geometrie řeší renderer; nejsou součástí samotné lokální odrazové funkce.'],
btf:['BTF — Bidirectional Texture Function','Dvě souřadnice texelu a čtyři úhlové souřadnice. Šest bez spektra, sedm se spektrem. Vzhled může obsahovat mikrostíny, zákryty i další efekty nerozlišené struktury.'],
bsdf:['BSDF — Bidirectional Scattering Distribution Function','Lokální odezva zahrnuje odraz i průchod. Běžný zápis používá dva směry na celé sféře: čtyři úhlové souřadnice. Původní schéma knihy počítá směry odrazu a transmise odděleně; jeho počet souřadnic není univerzální.'],
slf:['SLF — Surface Light Field','Mění se místo a pohled, osvětlení zůstává stejné. Čtyři souřadnice bez spektra. Pohledový odlesk lze zachytit, přesunout světlo nikoli.'],
srf:['SRF — Surface Reflectance Field','Mění se místo a osvětlení, kamera zůstává na místě. Čtyři souřadnice bez spektra.'],
brdf:['BRDF — Bidirectional Reflectance Distribution Function','Odraz ve stejném bodě povrchu. Zde homogenní materiál: závislost pouze na dvou směrech, tedy čtyřech úhlových souřadnicích.'],
btdf:['BTDF — Bidirectional Transmittance Distribution Function','Průchod do opačné polokoule v lokálním bodě interakce. Není náhradou přenosu mezi různými místy v BSSRDF.'],
ibrdf:['Izotropní BRDF','Současné otočení světla a pohledu kolem normály nemění odezvu. Stačí θᵢ, θₒ a rozdíl azimutů Δφ. Izotropní materiál může být lesklý; neznamená to Lambertův odraz.'],
texture:['Statická textura','Zbývá T(u,v), případně spektrální T(λ,u,v). Snímek vzhledu může mít zapečené stíny a odlesky. Textura albeda naopak ukládá parametr materiálu, nikoli hotový osvětlený vzhled.'],
dt:['Dynamická textura','T(u,v,t) přidává čas. Animovaný obrázek tím nezíská možnost měnit světlo nebo kameru.'],
'g-b':['GRF → BSSRDF: ustálený povrchový přenos','Předpokládáme okamžitý transport, časově neměnný materiál a zachování vlnové délky. Paprsky parametrizujeme na povrchu, při volném šíření odpadnou souřadnice podél paprsků. V odrazové větvi knihy vypouštíme samostatně sledovanou transmisi; vstupní a výstupní bod ale zůstávají různé.'],
'b-btf':['BSSRDF → BTF: odezva registrovaného texelu','Místo obecné vazby každé dvojice bodů sledujeme vzhled jednoho texelu při změně světla a pohledu. Mikroskopický přenos může zůstat zahrnutý ve vzhledu, ale nelze nezávisle zadávat libovolné místo vstupu a výstupu.'],
'b-sv':['BSSRDF → SVBRDF: lokální odraz','Zanedbáme přenos mezi různými body: vstup a výstup ztotožníme. Zachováme prostorovou proměnlivost lokálních materiálů. Na rozdíl od BTF neukládáme zákryty a mikrostíny jako součást odezvy.'],
'b-bs':['BSSRDF ⇢ BSDF: změna modelu, ne pouhá redukce','Zavedeme lokální interakci a zde homogenní materiál. Pro odrazovou část tak získáme BRDF. BSDF navíc zahrnuje transmisní větev BTDF — tu nelze získat pouhým vypuštěním argumentů odrazové BSSRDF. Proto je vazba přerušovaná.'],
'btf-slf':['BTF → SLF: zafixujeme osvětlení','Odpadnou dva volné úhly světla. Kamera se dál může pohybovat; při jiném osvětlení by bylo potřeba jiné pole.'],
'btf-srf':['BTF → SRF: zafixujeme pohled','Odpadnou dva volné úhly pohledu. Měníme světlo, ne kameru.'],
'bs-br':['BSDF → BRDF: vybereme odrazovou větev','Dopadající a odchozí směr leží ve stejné polokouli. Nejde o zanedbání odlesků; ponecháváme difuzní i lesklý odraz.'],
'bs-bt':['BSDF → BTDF: vybereme transmisní větev','Dopadající a odchozí směr leží na opačných stranách povrchu. Může jít o hladký i drsný průchod.'],
'slf-t':['SLF → textura: zafixujeme i pohled','Osvětlení již bylo pevné. Nyní odstraníme pohyb kamery a ponecháme jediný prostorový obraz.'],
'srf-t':['SRF → textura: zafixujeme i osvětlení','Kamera již byla pevná. Nyní vybereme jedno osvětlení a ponecháme prostorový obraz.'],
'br-i':['BRDF → izotropní BRDF: rotační invariance','Odezva nezávisí na společné rotaci obou azimutů, pouze na jejich rozdílu. Ztratíme orientované chování například kartáčovaného kovu.'],
't-dt':['Textura ⇢ dynamická textura: přidáme čas','Toto je rozšíření, nikoli zjednodušení. Z jediného snímku přecházíme k časové posloupnosti; světlo a pohled zůstávají pevné.']};
function activate(el){root.querySelectorAll('[data-tax]').forEach(n=>n.setAttribute('aria-pressed',String(n===el)));const [title,text]=data[el.dataset.tax],out=root.querySelector('.tax-map-detail');out.replaceChildren();out.scrollTop=0;const h=document.createElement('h2'),p=document.createElement('p');h.textContent=title;p.textContent=text;out.append(h);if(el.classList.contains('tax-node')){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Definice a souřadnice';details.append(summary,p);out.append(details);window.appendTaxonomyExample(out,el.dataset.tax);}else out.append(p);}
root.querySelectorAll('[data-tax]').forEach(el=>{el.addEventListener('click',()=>activate(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();activate(el);}});});activate(root.querySelector('[data-tax="grf"]'));
})();
