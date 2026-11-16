module.exports=function addSpatial(html){
 const title=/(<article[^>]+id="slide-22"[^>]*>[\s\S]*?<h2[^>]*>Akcelerační struktury<\/h2>)/;
 if(!title.test(html))throw Error('Missing acceleration slide');
 if(html.includes('data-spatial-demo'))return html;
 return html.replace(title,'$1<div data-spatial-demo><iframe loading="lazy" src="spatial/index.html" title="Quadtree, k-d strom a BVH s dendrogramy" style="width:100%;height:min(62vh,535px);border:0"></iframe><small><a href="spatial/index.html" target="_blank" rel="noopener">Otevřít ukázky v samostatném okně ↗</a></small></div>');
};
