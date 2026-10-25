"""Reproducible original BI-PGA scenes. Run with Blender 4.5 --background --python.
CPU only, eight threads. No third-party models/textures and no AI upscaling.
"""
import bpy, math, json, time, hashlib, sys
from pathlib import Path
from mathutils import Vector

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
OUT=Path(args[0] if args else 'tmp/pga-v2-renders').resolve(); OUT.mkdir(parents=True,exist_ok=True)
PILOT='--pilot' in args
SURFACE_ONLY='--surface-only' in args or '--surface-pilot' in args
SURFACE_PILOT='--surface-pilot' in args
records=[]
if SURFACE_ONLY and (OUT/'render-manifest.json').exists():
 records=[r for r in json.loads((OUT/'render-manifest.json').read_text(encoding='utf8'))['records'] if not r['file'].startswith('surface-')]

def mat(name,color,metal=0,rough=.35,glass=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;p.inputs['Transmission Weight'].default_value=glass;p.inputs['IOR'].default_value=1.5
 return m
def cube(name,loc,scale,material):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material);return o
def sphere(name,loc,r,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=r,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(material)
 for f in o.data.polygons:f.use_smooth=True
 return o
def reset():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.render.threads_mode='FIXED';s.render.threads=8;s.cycles.use_adaptive_sampling=False;s.cycles.seed=1729;s.cycles.use_denoising=True
 s.cycles.max_bounces=10;s.cycles.diffuse_bounces=6;s.cycles.glossy_bounces=6;s.cycles.transmission_bounces=8;s.cycles.sample_clamp_direct=0;s.cycles.sample_clamp_indirect=0
 s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGB';s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=0;s.view_settings.gamma=1
 s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.04,.04,.04,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.15
 return s
def camera(loc,target,ortho=None):
 bpy.ops.object.camera_add(location=loc);o=bpy.context.object;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();o.data.lens=45
 if ortho:o.data.type='ORTHO';o.data.ortho_scale=ortho
 bpy.context.scene.camera=o
def area(loc,power,size,target):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def save(name,width,height,samples,description,changes=None):
 s=bpy.context.scene;s.render.resolution_x=width;s.render.resolution_y=height;s.cycles.samples=samples;s.render.filepath=str(OUT/(name+'.png'));t=time.perf_counter();bpy.ops.render.render(write_still=True);elapsed=time.perf_counter()-t
 p=OUT/(name+'.png');records.append(dict(file=p.name,width=width,height=height,samples=samples,seconds=round(elapsed,3),renderer='Blender '+bpy.app.version_string+' / Cycles CPU',seed=s.cycles.seed,denoising=s.cycles.use_denoising,maxBounces=s.cycles.max_bounces,diffuseBounces=s.cycles.diffuse_bounces,viewTransform=s.view_settings.view_transform,look=s.view_settings.look,exposureEV=s.view_settings.exposure,description=description,changedParameter=changes,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
 (OUT/'render-manifest.json').write_text(json.dumps({'created':'2026-10-25','originalWork':'BI-PGA controlled teaching scenes; no external assets','renderScriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'records':records},indent=2,ensure_ascii=False),encoding='utf8')
def cornell():
 s=reset();white=mat('Neutral matte',(.68,.68,.68));red=mat('Red wall',(.55,.035,.025));green=mat('Green wall',(.03,.44,.07))
 cube('floor',(0,0,-.08),(5,5,.16),white);cube('rear',(0,2.5,2.3),(5,.15,4.6),white);cube('left',(-2.5,0,2.3),(.15,5,4.6),red);cube('right',(2.5,0,2.3),(.15,5,4.6),green)
 sphere('Glass',(-1.0,.3,.95),.95,mat('Clear glass',(.97,.99,1),0,.025,1));sphere('Mirror',(.95,1.1,.78),.78,mat('Silver',(.91,.92,.94),1,.06));cube('Matte cube',(.65,-.65,.5),(1,1,1),mat('Diffuse ochre',(.65,.37,.07)))
 cube('ceiling',(0,0,4.65),(5,5,.15),white)
 area((-.6,.3,4.25),450,1.7,(0,.4,0));camera((0,-10,4.2),(0,.6,1.9));s.camera.data.lens=38;return s

if not SURFACE_ONLY:
 s=cornell()
 if PILOT:
  save('pilot',640,360,16,'Pilot of the original teaching Cornell-like scene');print('PILOT_COMPLETE',OUT);sys.exit()
 save('lighting-hero',3840,2160,64,'Original Cornell-like scene. Diffuse interreflection, glass and metal; not a photon-mapping comparison.')
 bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'lighting-scene.blend'))
 s.cycles.max_bounces=0;save('lighting-direct',1600,900,64,'Same scene and exposure; Cycles max_bounces=0. Direct lighting, not an implementation of Whitted tracing.','max_bounces: 10 -> 0')
 s.cycles.max_bounces=10;save('lighting-indirect',1600,900,64,'Same scene; ten total and six diffuse bounces.','max_bounces: 0 -> 10')
 s.cycles.use_denoising=False
 for samples in [1,16,64,256]:save('noise-'+str(samples),960,540,samples,'Fixed scene/camera/seed/exposure; raw noisy rendering without denoising.','samples')

 s=reset();floor=mat('Floor',(.17,.19,.21),0,.7);cube('Floor',(0,0,-.1),(18,8,.15),floor)
 for row,metal in enumerate([0,1]):
  for col,r in enumerate([.05,.15,.35,.65,.9]):sphere(('Metal' if metal else 'Dielectric')+str(r),(-4.4+col*2.2,(row-.5)*2.6,1),.9,mat('r'+str(r)+'m'+str(metal),(.58,.22,.055),metal,r))
 area((-2,-3,8),1600,5,(0,0,0));area((5,3,5),900,3,(0,0,1));camera((7,-12,12),(0,0,.5),13.8)
 save('roughness-metallic',2560,1440,96,'Top/far row metal=1, bottom/near row metal=0; left-to-right roughness .05,.15,.35,.65,.9. Same base color and lights.')

def height(x,y):return .09*math.sin(6*x)*math.sin(6*y)+.035*math.sin(13*x+4*y)
def texture_nodes(material,offset=False,normal=False,normal_wrong=False,flip=False):
 nt=material.node_tree;nodes=nt.nodes;links=nt.links;p=nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.34,.23,.1,1);p.inputs['Roughness'].default_value=.48
 # One periodic scalar field used by bump, encoded normals and actual geometry.
 N=256;im=bpy.data.images.new('AnalyticHeight',width=N,height=N,float_buffer=True)
 pix=[];npix=[]
 for j in range(N):
  for i in range(N):
   x=-2+4*i/(N-1);y=-2+4*j/(N-1);h=height(x,y);pix.extend((h+.5,h+.5,h+.5,1))
   dx=.54*math.cos(6*x)*math.sin(6*y)+.455*math.cos(13*x+4*y);dy=.54*math.sin(6*x)*math.cos(6*y)+.14*math.cos(13*x+4*y);v=Vector((-dx,-dy,1)).normalized();npix.extend((v.x*.5+.5,(-v.y if flip else v.y)*.5+.5,v.z*.5+.5,1))
 im.colorspace_settings.name='Non-Color';im.pixels=pix;im.update();im.pack();tex=nodes.new('ShaderNodeTexImage');tex.image=im;tex.extension='EXTEND'
 uv=nodes.new('ShaderNodeTexCoord');links.new(uv.outputs['UV'],tex.inputs['Vector'])
 if offset:
  mul=nodes.new('ShaderNodeVectorMath');mul.operation='SCALE';links.new(tex.outputs['Color'],mul.inputs[0]);mul.inputs[3].default_value=.09
  sub=nodes.new('ShaderNodeVectorMath');sub.operation='SUBTRACT';links.new(uv.outputs['UV'],sub.inputs[0]);links.new(mul.outputs['Vector'],sub.inputs[1]);tex2=nodes.new('ShaderNodeTexImage');tex2.image=im;links.new(sub.outputs['Vector'],tex2.inputs['Vector']);tex=tex2
 if normal:
  # Float generated images are already linear inside Blender. Use a real encoded
  # byte PNG, then reload it, so sRGB/Non-Color demonstrates actual file decoding.
  ni=bpy.data.images.new('EncodedNormal',width=N,height=N,float_buffer=False);ni.colorspace_settings.name='Non-Color';ni.pixels=npix;ni.update()
  data_dir=OUT/'generated-data';data_dir.mkdir(exist_ok=True);normal_file=data_dir/('normal-flipped.png' if flip else 'normal-gl.png');ni.filepath_raw=str(normal_file);ni.file_format='PNG';ni.save()
  loaded=bpy.data.images.load(str(normal_file),check_existing=False);loaded.colorspace_settings.name='sRGB' if normal_wrong else 'Non-Color';loaded.pack()
  nm=nodes.new('ShaderNodeTexImage');nm.image=loaded;links.new(uv.outputs['UV'],nm.inputs['Vector']);normal_node=nodes.new('ShaderNodeNormalMap');links.new(nm.outputs['Color'],normal_node.inputs['Color']);links.new(normal_node.outputs['Normal'],p.inputs['Normal'])
 else:
  bump=nodes.new('ShaderNodeBump');bump.inputs['Distance'].default_value=1;links.new(tex.outputs['Color'],bump.inputs['Height']);links.new(bump.outputs['Normal'],p.inputs['Normal'])

def surface(kind):
 s=reset();m=mat('Material',(.34,.23,.1),0,.48);cube('Floor',(0,0,-.4),(10,10,.2),mat('Ground',(.14,.16,.19)))
 if kind=='displacement':
  N=180;verts=[(-2+4*i/N,-2+4*j/N,height(-2+4*i/N,-2+4*j/N)) for j in range(N+1) for i in range(N+1)];faces=[(j*(N+1)+i,j*(N+1)+i+1,(j+1)*(N+1)+i+1,(j+1)*(N+1)+i) for j in range(N) for i in range(N)];mesh=bpy.data.meshes.new('TrueDisplacedSurface');mesh.from_pydata(verts,[],faces);o=bpy.data.objects.new('Actual height geometry',mesh);bpy.context.collection.objects.link(o)
  for f in mesh.polygons:f.use_smooth=True
 else:
  bpy.ops.mesh.primitive_plane_add(size=4);o=bpy.context.object
 o.data.materials.append(m)
 if kind not in ['albedo','displacement']:texture_nodes(m,normal=True,normal_wrong=kind=='normal-srgb',flip=kind=='normal-flipped') if kind.startswith('normal') else texture_nodes(m)
 area((-3,-2,5),850,1.8,(0,0,0));area((4,2,4),150,2,(0,0,0));camera((5,-7,4),(0,0,0),6.0);return s
for kind in ['albedo','bump','normal','displacement','normal-srgb','normal-flipped']:
 surface(kind);save('surface-'+kind,640 if SURFACE_PILOT else 1920,360 if SURFACE_PILOT else 1080,16 if SURFACE_PILOT else 64,'Same original analytic height field, camera and lighting. '+kind,'surface representation / normal decoding')
 if kind=='displacement':bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'surface-scene.blend'))
print('ALL_RENDERS_COMPLETE',OUT)
