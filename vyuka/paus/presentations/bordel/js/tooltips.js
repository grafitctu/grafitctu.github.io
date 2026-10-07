// Comprehensive Game Development & Engine Acronym Dictionary
const GLOSSARY = {
    "BSP": { title: "Binary Space Partitioning", desc: "Binární dělení 3D prostoru pro rychlé určování viditelnosti a kolizí (Doom, Quake)." },
    "API": { title: "Application Programming Interface", desc: "Standardizované rozhraní pro komunikaci mezi softwarovými knihovnami a hardwarem." },
    "GPU": { title: "Graphics Processing Unit", desc: "Grafický procesor specializovaný na paralelní výpočty rasterizace, shaderů a geometrie." },
    "CPU": { title: "Central Processing Unit", desc: "Hlavní procesor počítače provádějící herní logiku, fyziku a systémové příkazy." },
    "RAM": { title: "Random Access Memory", desc: "Rychlá operační paměť počítače pro ukládání běžícího programu a herních dat." },
    "VRAM": { title: "Video RAM", desc: "Vyhrazená paměť na grafické kartě pro textury, shadery, geometrii a framebuffery." },
    "FPS": { title: "Frames Per Second", desc: "Snímková frekvence udávající počet vykreslených snímků za 1 sekundu." },
    "OS": { title: "Operating System", desc: "Operační systém (Windows, macOS, Linux, Android, iOS)." },
    "HW": { title: "Hardware", desc: "Fyzické vybavení počítače, konzole nebo mobilního zařízení." },
    "UI": { title: "User Interface", desc: "Uživatelské rozhraní (menu, dialogy, tlačítka, HUD)." },
    "GUI": { title: "Graphical User Interface", desc: "Grafické uživatelské rozhraní pro ovládání programu." },
    "HUD": { title: "Heads-Up Display", desc: "Prvky rozhraní zobrazené přímo přes herní scénu (životy, kompas, munice)." },
    "AI": { title: "Artificial Intelligence", desc: "Umělá inteligence řídící chování NPC postav a nepřátel ve hře." },
    "NPC": { title: "Non-Player Character", desc: "Herní postava neovládaná hráčem (např. vesničan, obchodník či nepřítel)." },
    "PBR": { title: "Physically Based Rendering", desc: "Fyzikálně věrné vykreslování materiálů (Albedo, Roughness, Metallic, Normal)." },
    "MVP": { title: "Model-View-Projection", desc: "Transformační matice převádějící 3D souřadnice modelu na 2D obrazovku." },
    "MSAA": { title: "Multi-Sample Anti-Aliasing", desc: "Hardwarové vyhlazování zubatých hran polygonů vzorkováním více subpixelů." },
    "LOD": { title: "Level of Detail", desc: "Úroveň detailu 3D modelu snižující počet polygonů u vzdálenějších objektů." },
    "AABB": { title: "Axis-Aligned Bounding Box", desc: "Osové ohraničující kvádry pro bleskové vyloučení nemožných kolizí v Broad Phase." },
    "BVH": { title: "Bounding Volume Hierarchy", desc: "Stromová hierarchie ohraničujících těles pro prostorové vyhledávání a kolize." },
    "GJK": { title: "Gilbert-Johnson-Keerthi", desc: "Algoritmus pro přesný výpočet vzdálenosti a průniku konvexních těles." },
    "SAT": { title: "Separating Axis Theorem", desc: "Věta o oddělující ose pro detekci kolizí mezi konvexními mnohostěny." },
    "FFI": { title: "Foreign Function Interface", desc: "Rozhraní umožňující volat funkce mezi různými jazyky (např. C# a C++)." },
    "JIT": { title: "Just-In-Time Compilation", desc: "Kompilace mezikódu (bytecode) do strojového kódu CPU až za běhu programu." },
    "AOT": { title: "Ahead-Of-Time Compilation", desc: "Kompilace mezikódu do nativního strojového kódu předem před distribucí." },
    "VM": { title: "Virtual Machine", desc: "Virtuální stroj provádějící mezikód (např. .NET CLR, JVM, GDScript VM)." },
    "CLR": { title: "Common Language Runtime", desc: "Virtuální běhové prostředí pro běh .NET a C# kódu." },
    "GC": { title: "Garbage Collector", desc: "Automatický správce paměti uvolňující nepoužívané objekty z haldy (Heap)." },
    "OOP": { title: "Object-Oriented Programming", desc: "Objektově orientované programování (třídy, dědičnost, zapouzdření)." },
    "DOD": { title: "Data-Oriented Design", desc: "Návrh architektury optimalizovaný pro uspořádání dat v paměti a L1/L2 CPU Cache." },
    "ECS": { title: "Entity Component System", desc: "Architektura oddělující Entity (ID), Component (čistá data) a System (logika)." },
    "DOTS": { title: "Data-Oriented Tech Stack", desc: "Vysoce výkonný stack Unity: Entities, Job System a Burst Compiler." },
    "SIMD": { title: "Single Instruction, Multiple Data", desc: "Vektorové instrukce procesoru provádějící stejnou operaci nad více čísly naráz." },
    "AVX": { title: "Advanced Vector Extensions", desc: "Sada SIMD vektorových instrukcí procesorů x86 (Intel / AMD)." },
    "NEON": { title: "ARM Advanced SIMD", desc: "Vektorová architektura procesorů ARM (mobilní zařízení, Apple Silicon)." },
    "URP": { title: "Universal Render Pipeline", desc: "Optimalizovaná a vysoce flexibilní renderovací pipeline v Unity." },
    "HDRP": { title: "High Definition Render Pipeline", desc: "Renderovací pipeline v Unity pro fotorealistickou grafiku na PC a konzolích." },
    "RHI": { title: "Render Hardware Interface", desc: "Abstrakční vrstva v Unreal Engine sjednocující DirectX, Vulkan a Metal." },
    "GI": { title: "Global Illumination", desc: "Globální osvětlení scény počítající i nepřímé odrazy světla od povrchů." },
    "VSM": { title: "Virtual Shadow Maps", desc: "Virtuální stínové mapy s vysokým rozlišením v Unreal Engine 5." },
    "GAS": { title: "Gameplay Ability System", desc: "Modulární framework v Unreal Engine pro tvorbu RPG schopností a atributů." },
    "PSO": { title: "Pipeline State Object", desc: "Předkompilovaný stav grafické pipeline eliminující záseky při kompilaci shaderů." },
    "RPC": { title: "Remote Procedure Call", desc: "Vzdálené volání procedur přes síť pro synchronizaci stavu v multiplayeru." },
    "TPS": { title: "Ticks Per Second", desc: "Frekvence aktualizace fyzikální simulace (počet kroků za sekundu)." },
    "VR": { title: "Virtual Reality", desc: "Virtuální realita (zobrazení do VR brýlí/headsetu)." },
    "AR": { title: "Augmented Reality", desc: "Rozšířená realita (vkládání 3D objektů do obrazu reálného světa)." },
    "XR": { title: "Extended Reality", desc: "Souhrnný termín pro virtuální (VR), rozšířenou (AR) a smíšenou realitu." },
    "AAA": { title: "Triple-A", desc: "Hry s nejvyšším rozpočtem a špičkovými produkčními hodnotami." },
    "MIT": { title: "MIT License", desc: "Svobodná open-source licence pro volné komerční i nekomerční použití bez poplatků." },
    "SDK": { title: "Software Development Kit", desc: "Sada nástrojů a knihoven pro vývoj softwaru pro danou platformu." },
    "G-Buffer": { title: "Geometry Buffer", desc: "Sada textur (albedo, normály, hloubka) v Deferred renderovací pipeline." },
    "APV": { title: "Adaptive Probe Volumes", desc: "Systém světelných sond v Unity pro efektivní globální osvětlení." },
    "IL2CPP": { title: "Intermediate Language to C++", desc: "Nástroj Unity převádějící .NET CIL mezikód do C++ pro nativní kompilaci." },
    "SPIR-V": { title: "Standard Portable Intermediate Representation", desc: "Binární mezikód pro shadery v rozhraní Vulkan." },
    "DXIL": { title: "DirectX Intermediate Language", desc: "Binární mezikód pro shadery v rozhraní DirectX 12." },
    "HLSL": { title: "High-Level Shader Language", desc: "Vyšší jazyk pro psaní shaderů vyvinutý společností Microsoft pro DirectX." },
    "GLSL": { title: "OpenGL Shading Language", desc: "Programovací jazyk pro tvorbu shaderů pro OpenGL a Vulkan." },
    "CCD": { title: "Continuous Collision Detection", desc: "Technika, která zabraňuje tzv. tunnelingu (procházení těles skrze sebe při vysokých rychlostech nebo v malých tloušťkách). Místo pouhého testování překryvu v jediném časovém okamžiku testuje dráhu/objem, který těleso opíše během celého časového kroku $\Delta t$." },
    "Broadphase": { title: "Broadphase Collision Detection", desc: "Rychlý algoritmus, který z výpočtu okamžitě vyřadí dvojice těles, které jsou od sebe příliš daleko a určitě spolu nesouvisí (používá jednoduché hraniční obálky jako AABB stromy nebo Sweep-and-Prune). Výstupem je pouze užší seznam potenciálních kolizí." },
    "Albedo": { title: "Albedo", desc: "Základní barva povrchu materiálu bez vlivu osvětlení." },
    "Roughness": { title: "Roughness", desc: "Míra drsnosti povrchu materiálu, která ovlivňuje rozptyl světla." },
    "Metallic": { title: "Metallic", desc: "Míra kovovosti povrchu materiálu." },
    "Normal": { title: "Normal", desc: "Směr povrchu materiálu." },
    "Bloom": { title: "Bloom", desc: "Post-processing efekt simulující rozptyl jasných světel ve scéně (světelná záře)." },
    "Tone Mapping": { title: "Tone Mapping", desc: "Post-processing efekt pro převod High Dynamic Range (HDR) do Low Dynamic Range (LDR)." },
    "Color Grading": { title: "Color Grading", desc: "Post-processing efekt pro úpravu barev a kontrastu scény." },
    "SSAO": { title: "Screen Space Ambient Occlusion", desc: "Post-processing efekt pro simulaci ambient occlusion." },
    "Motion Blur": { title: "Motion Blur", desc: "Post-processing efekt pro simulaci rozmazání pohybem." },
    "SAP": { title: "Sweep and Prune", desc: "Promítnutí hranic objektů (jejich AABB) na jednu nebo více souřadnicových os ($X, Y, Z$) a v hledání překryvů pouze v těchto 1D intervalech." },
    "Ragdoll": { title: "Ragdoll Physics", desc: "Simulace končetin lidského těla pomocí sítě kloubů, která umožňuje přirozené chování postav při pádu nebo smrti místo přehrávání předem připravené (klíčované) animace ." },
    "Culling": { title: "Object Culling", desc: "Technika, která zabraňuje vykreslování objektů, které nejsou viditelné na obrazovce." },
    "Frustum": { title: "View Frustum", desc: "Vykreslovací prostor kamery, který určuje, které objekty jsou viditelné na obrazovce." },
    "Command Buffers": { title: "Command Buffer", desc: "Command buffer je paměťová struktura, do které se vkládá posloupnost příkazů pro grafickou kartu, aby je mohla později asynchronně a efektivně vykonat." },
    "Pixel Shader": { title: "Pixel Shader", desc: "V OpenGL Fragment Shader je program běžící na GPU, který počítá barvu pixelu (při rasterizaci)." },
    "Vertex Shader": { title: "Vertex Shader", desc: "Program běžící na GPU, který počítá pozici a další atributy vrcholů polygonů." },
    "Lightmap": { title: "Lightmap", desc: "Textura, do které jsou předem vypočítány a „upečeny“ (baked) informace o osvětlení, stínech a odrazech světla v 3D scéně." },
    "Ambient Occlusion": { title: "Ambient Occlusion", desc: "Ambient occlusion (zastínění okolím) je metoda stínování, která pomáhá modelům pro výpočet lokálního osvětlení dodat realistický dojem započítáním tlumení světla zastíněním." },
    "DLSS": { title: "Deep Learning Super Sampling", desc: "Technologie NVIDIA, která využívá umělou inteligenci k rekonstrukci obrazu s nižším rozlišením na vyšší" },
    "FSR": { title: "AMD FidelityFX Super Resolution", desc: "Technologie AMD, která využívá umělou inteligenci k rekonstrukci obrazu s nižším rozlišením na vyšší." },
    "XeSS": { title: "Intel Xe Super Sampling", desc: "Technologie Intel, která využívá umělou inteligenci k rekonstrukci obrazu s nižším rozlišením na vyšší." },
    "TSR": { title: "Temporal Super Resolution", desc: "Technologie v Unreal Enginu 5 pro rekonstrukci obrazu z nižšího rozlišení na vyšší." },
    "Custom arena allocator": { title: "Custom arena allocator", desc: "Custom Arena Allocator (často nazývaný také Linear Allocator nebo Region-based Allocator) je vlastní systém správy paměti, který si od operačního systému předem vyžádá jeden velký souvislý blok paměti a následně z něj rychle přiděluje menší části prostým posouváním ukazatele." },
    "Chaos Physics": { title: "Chaos Physics", desc: "Fyzikální engine vyvinutý společností Epic Games, který je součástí Unreal Enginu 5." },
    "CoreCLR": { title: "CoreCLR", desc: "CoreCLR (Core Common Language Runtime) je spouštěcí prostředí (runtime execution engine) ekosystému .NET.  " },
    "DoF": { title: "Degrees of Freedom", desc: "Degrees of Freedom (stupně volnosti) popisují počet nezávislých pohybů, kterými se těleso nebo systém může v prostoru volně pohybovat (pozice/rotace). " },
    "VAC": { title: "Vergence-Accommodation Conflict", desc: "Vergence-Accommodation Conflict (VAC) je jev, který nastává ve virtuální realitě, kdy lidské oko musí zároveň zaostřit na virtuální objekt (akomodace) a zároveň stočit oční osy k němu (vergence). " },
    "HCI": { title: "Human-Computer Interaction", desc: "Human-Computer Interaction je výzkum interakce mezi člověkem a počítačem." },
    "MR": { title: "Mixed Reality", desc: "Mixed Reality je technologie, která kombinuje virtuální realitu a rozšířenou realitu." },
    "AV": { title: "Augmented Virtuality", desc: "Augmented Virtuality je technologie, která kombinuje virtuální realitu a rozšířenou realitu." },
    "Haptic feedback": { title: "Haptic feedback", desc: "Haptic feedback je technologie, která kombinuje virtuální realitu a rozšířenou realitu." },
    "IPD": { title: "Interpupillary Distance", desc: "Interpupillary Distance (IPD) je vzdálenost mezi středy zornic. " },
    "FoV": { title: "Field of View", desc: "Field of View (FoV) je úhel, pod kterým může zařízení vidět scénu. " },
    "M2P": { title: "Motion to Photon", desc: "Měří zpoždění mezi pohybem hlavy uživatele a vykreslením odpovídajícího obrazu v headsetu." },
    "IR": { title: "Infrared", desc: "Infračervené světlo." },
    "Foveated rendering": { title: "Foveated rendering", desc: "Foveated rendering je technologie vykreslování, která využívá sledování oka (eye tracking) k optimalizaci grafického výkonu. Místo vykreslování celé scény ve vysokém rozlišení se detailní rendering zaměřuje pouze na oblast, kam se uživatel právě dívá (fovea), zatímco periferní oblasti jsou vykreslovány v nižším rozlišení. Tím se výrazně snižuje zátěž GPU, aniž by došlo k vizuální degradaci v klíčové zóně vidění." },
    "SLAM": { title: "Simultaneous Localization and Mapping", desc: "Algoritmus, který zároveň mapuje neznámé prostředí a určuje v něm polohu zařízení/kamery. Základ moderního bezmarkerového AR trackingu." },
    "VIO": { title: "Visual-Inertial Odometry", desc: "Fúze vizuálního odhadu pohybu (z kamery) s inerciálními senzory (IMU). Je základem ARKitu, ARCore a moderních headsetů." },
    "VST": { title: "Video See-Through", desc: "Zobrazování reálného světa přes kamery a displeje (na rozdíl od průhledné optiky). Zajišťuje dokonalé překrytí a kontrast." },
    "ToF": { title: "Time of Flight", desc: "Senor měřící hloubku scény podle času návratu odraženého světla. Používá se pro occlusion a 3D sken." },
    "LiDAR": { title: "Light Detection and Ranging", desc: "Laserový senzor měřící vzdálenost od objektů. Slouží k přesnému odhadu hloubky scény pro AR." },
    "IMU": { title: "Inertial Measurement Unit", desc: "Elektronické zařízení měřící zrychlení a úhlovou rychlost (akcelerometr + gyroskop)." },
    "EKF": { title: "Extended Kalman Filter", desc: "Nelineární varianta Kalmanova filtru pro fúzi dat ze senzorů, např. IMU s optickou kamerou." },
    "HRTF": { title: "Head-Related Transfer Function", desc: "Funkce modelující, jak hlava, trup a uši ovlivňují přicházející zvuk. Základ prostorového (3D) zvuku." },
    "OpenXR": { title: "OpenXR", desc: "Otevřený standard (Khronos Group) pro cross-platform vývoj XR aplikací. Jeden kód běží na Quest, HoloLens i Vision Pro." },
    "WebXR": { title: "WebXR", desc: "W3C standard pro AR/VR přímo ve webovém prohlížeči. Používá se pro WebAR, např. s A-Frame nebo Three.js." },
    "VPS": { title: "Visual Positioning System", desc: "Lokalizace kombinující GPS s porovnáním obrazu z kamery proti 3D databázi světa. Dosahuje až centimetrové přesnosti." },
    "SAM": { title: "Segment Anything Model", desc: "Model Meta pro segmentaci jakéhokoliv objektu v obraze. Využívá se v AR pro porozumění scéně a interakci." },
    "Neural Depth": { title: "Neural Depth Estimation", desc: "Odhad hloubky scény neuronovou sítí z jedné RGB kamery, bez hloubkového senzoru." },
    "Micro-OLED": { title: "Micro-OLED", desc: "Vysokorozlišovací OLED displeje v miniaturním provedení používané v AR/VR brýlích pro husté pixely." },
    "Micro-LED": { title: "Micro-LED", desc: "Velmi jasné a úsporné displeje s mikroskopickými LED prvky určené pro AR brýle." },
    "Spatial Computing": { title: "Spatial Computing", desc: "Interakce s technologií v trojrozměrném prostoru kolem uživatele. Pojem popularizovaný Apple (Vision Pro) a Magic Leap." },
    "Spatial Audio": { title: "Spatial Audio", desc: "Prostorový zvuk lokalizující zdroje ve 3D prostoru pomocí HRTF. Zvyšuje imerzi v AR/VR." },
    "vSLAM": { title: "Visual SLAM", desc: "SLAM založený čistě na vizuálních datech z kamery, bez inerciálních senzorů." },
    "Android XR": { title: "Android XR", desc: "Otevřený XR ekosystém od Googlu a Samsungu postavený na systému Android a čipu Snapdragon XR2+ Gen 2." },
    "Passthrough": { title: "Passthrough", desc: "Zobrazování reálného světa pomocí kamer na displeji headsetu (Video See-Through)." },
    "Waveguide": { title: "Waveguide", desc: "Vlnovod: průhledná optická struktura přivádějící obraz z mikrodispleje do oka uživatele u AR brýlí." },
    "Eye tracking": { title: "Eye Tracking", desc: "Sledování směru pohledu očí uživatele. V AR/MR slouží k interakci i efektivnímu vykreslování (foveated rendering)." },
    "Segment Anything Model": { title: "SAM (Segment Anything)", desc: "Model Meta pro segmentaci jakéhokoliv objektu v obraze. Využívá se v AR pro porozumění scéně a interakci." },
    "DCI-P3": { title: "DCI-P3", desc: "Digial Cinema Initiatives - Product 3. Široký barevný gamut využívaný digitálními kiny a profesionálními displeji." },
    "Blend Spaces": { title: "Blend Spaces", desc: "Technika pro plynulé přechody mezi animacemi na základě více vstupů (např. rychlost a úhel)." },
    "Inverse Kinematics": { title: "Inverse Kinematics", desc: "Obrácená kinematika: výpočet úhlů kloubů pro dosažení požadované pozice končetin." },
    "Forward Shading": { title: "Forward Shading", desc: "Typ shaderu, který počítá osvětlení pro každý pixel zvlášť, na rozdíl od deferred shading" },
    "HDR": { title: "High Dynamic Range", desc: "Technologie, která umožňuje zobrazení širšího rozsahu jasu a barev než standardní zobrazení. Využívá se v AR/VR pro zvýšení imerze a realismu." },
    "FXAA": { title: "Fast Approximate Anti-Aliasing", desc: "Post-processing efekt pro vyhlazování hran polygonů" },
    "TAA": { title: "Temporal Anti-Aliasing", desc: "Anti-aliasing, který využívá informace z předchozích snímků pro vyhlazování hran polygonů" },
    "Slerp": { title: "Spherical Linear Interpolation", desc: "Slerp je metoda pro lineární interpolaci mezi dvěma rotacemi." },
    "Gimbal lock": { title: "Gimbal lock", desc: "Gimbal lock je ztráta jednoho stupně volnosti v trojrozměrnostním prostoru, ke které dochází, když se osy dvou ze tří rotačních prstů (nebo Eulerových úhlů) srovnají do jedné přímky" },
}

function initAcronymTooltips() {
    const tooltip = document.getElementById('global-tooltip');
    const titleEl = tooltip.querySelector('.tooltip-title');
    const abbrEl = tooltip.querySelector('.tooltip-abbr');
    const bodyEl = tooltip.querySelector('.tooltip-body');

    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${terms.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'g');

    const walker = document.createTreeWalker(
        document.querySelector('.reveal .slides'),
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (['script', 'style', 'pre', 'code', 'textarea'].includes(tag) ||
                    parent.closest('pre') || parent.closest('code') ||
                    parent.closest('.katex') || parent.classList.contains('abbr-tag')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const nodesToReplace = [];
    while (walker.nextNode()) {
        if (pattern.test(walker.currentNode.nodeValue)) {
            nodesToReplace.push(walker.currentNode);
        }
        pattern.lastIndex = 0;
    }

    nodesToReplace.forEach(node => {
        const span = document.createElement('span');
        span.innerHTML = node.nodeValue.replace(pattern, (match) => {
            return `<span class="abbr-tag" data-term="${match}">${match}</span>`;
        });
        node.parentNode.replaceChild(span, node);
    });

    function showTooltip(term, e) {
        const data = GLOSSARY[term];
        if (!data) return;
        titleEl.textContent = data.title;
        abbrEl.textContent = term;
        bodyEl.textContent = data.desc;

        tooltip.classList.add('active');
        positionTooltip(e);
    }

    function hideTooltip() {
        tooltip.classList.remove('active');
    }

    function positionTooltip(e) {
        const padding = 15;
        let x = e.clientX + 12;
        let y = e.clientY + 14;

        const rect = tooltip.getBoundingClientRect();
        if (x + rect.width > window.innerWidth - padding) {
            x = e.clientX - rect.width - 12;
        }
        if (y + rect.height > window.innerHeight - padding) {
            y = e.clientY - rect.height - 12;
        }

        tooltip.style.left = `${Math.max(padding, x)}px`;
        tooltip.style.top = `${Math.max(padding, y)}px`;
    }

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('.abbr-tag, abbr[title]');
        if (target) {
            const term = target.getAttribute('data-term') || target.textContent.trim();
            showTooltip(term, e);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (tooltip.classList.contains('active')) {
            positionTooltip(e);
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.abbr-tag, abbr[title]')) {
            hideTooltip();
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initAcronymTooltips();
});
