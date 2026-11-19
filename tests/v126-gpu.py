#!/usr/bin/env python3
"""Verify the actual hall shader against the supplied full spherical source.
Usage: v126-gpu.py SHADER_CAPTURE.json SOURCE.png REVIEW_DIR
Requires Mesa EGL ES2, numpy and Pillow. This is not a browser layout test.
"""
import ctypes as C
import json
from pathlib import Path
import sys
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
data = json.loads(Path(sys.argv[1]).read_text())
E = C.CDLL('libEGL.so.1')
E.eglGetProcAddress.argtypes = [C.c_char_p]
E.eglGetProcAddress.restype = C.c_void_p

def egl(name, result, args):
    f = getattr(E, name); f.restype = result; f.argtypes = args; return f

def gl(name, result, args):
    return C.CFUNCTYPE(result, *args)(E.eglGetProcAddress(name.encode()))

platform = C.CFUNCTYPE(C.c_void_p, C.c_uint, C.c_void_p, C.c_void_p)(E.eglGetProcAddress(b'eglGetPlatformDisplayEXT'))
display = platform(0x31DD, None, None)
a, b = C.c_int(), C.c_int()
assert egl('eglInitialize', C.c_uint, [C.c_void_p, C.c_void_p, C.c_void_p])(display, C.byref(a), C.byref(b))
assert egl('eglBindAPI', C.c_uint, [C.c_uint])(0x30A0)
attrs = (C.c_int*11)(0x3033, 1, 0x3040, 4, 0x3024, 8, 0x3023, 8, 0x3022, 8, 0x3038)
config, count = C.c_void_p(), C.c_int()
assert egl('eglChooseConfig', C.c_uint, [C.c_void_p,C.c_void_p,C.c_void_p,C.c_int,C.c_void_p])(display,attrs,C.byref(config),1,C.byref(count)) and count.value
surface = egl('eglCreatePbufferSurface',C.c_void_p,[C.c_void_p,C.c_void_p,C.c_void_p])(display,config,(C.c_int*5)(0x3057,960,0x3056,540,0x3038))
context = egl('eglCreateContext',C.c_void_p,[C.c_void_p,C.c_void_p,C.c_void_p,C.c_void_p])(display,config,None,(C.c_int*3)(0x3098,2,0x3038))
assert egl('eglMakeCurrent',C.c_uint,[C.c_void_p]*4)(display,surface,surface,context)
shader = gl('glCreateShader',C.c_uint,[C.c_uint])
source = gl('glShaderSource',None,[C.c_uint,C.c_int,C.POINTER(C.c_char_p),C.c_void_p])
compile_shader = gl('glCompileShader',None,[C.c_uint])
shader_iv = gl('glGetShaderiv',None,[C.c_uint,C.c_uint,C.c_void_p])
shader_log = gl('glGetShaderInfoLog',None,[C.c_uint,C.c_int,C.c_void_p,C.c_void_p])
create_program = gl('glCreateProgram',C.c_uint,[])
attach = gl('glAttachShader',None,[C.c_uint,C.c_uint])
link = gl('glLinkProgram',None,[C.c_uint])
program_iv = gl('glGetProgramiv',None,[C.c_uint,C.c_uint,C.c_void_p])
use = gl('glUseProgram',None,[C.c_uint])
location = gl('glGetUniformLocation',C.c_int,[C.c_uint,C.c_char_p])
u1i = gl('glUniform1i',None,[C.c_int,C.c_int]);u1f = gl('glUniform1f',None,[C.c_int,C.c_float])
u2f = gl('glUniform2f',None,[C.c_int,C.c_float,C.c_float])
u3f = gl('glUniform3f',None,[C.c_int,C.c_float,C.c_float,C.c_float])
u4f = gl('glUniform4f',None,[C.c_int]+[C.c_float]*4)
um = gl('glUniformMatrix3fv',None,[C.c_int,C.c_int,C.c_uint,C.c_void_p])
texture = gl('glGenTextures',None,[C.c_int,C.c_void_p]);active = gl('glActiveTexture',None,[C.c_uint])
bind = gl('glBindTexture',None,[C.c_uint,C.c_uint]);param = gl('glTexParameteri',None,[C.c_uint,C.c_uint,C.c_int])
upload = gl('glTexImage2D',None,[C.c_uint,C.c_int,C.c_int,C.c_int,C.c_int,C.c_int,C.c_uint,C.c_uint,C.c_void_p])
vertex_attrib = gl('glGetAttribLocation',C.c_int,[C.c_uint,C.c_char_p])
enable = gl('glEnableVertexAttribArray',None,[C.c_uint])
pointer = gl('glVertexAttribPointer',None,[C.c_uint,C.c_int,C.c_uint,C.c_uint,C.c_int,C.c_void_p])
draw = gl('glDrawArrays',None,[C.c_uint,C.c_int,C.c_int])
viewport = gl('glViewport',None,[C.c_int]*4)
read = gl('glReadPixels',None,[C.c_int]*4+[C.c_uint,C.c_uint,C.c_void_p])
error = gl('glGetError',C.c_uint,[])

source_image=np.asarray(Image.open(sys.argv[2]).convert('RGB'))
faces=[np.asarray(Image.open(ROOT/'assets/hq/panorama126'/f'{n}.webp').convert('RGBA')) for n in ['px','nx','py','ny','pz','nz']]
program=create_program()
for kind,key in [(0x8B31,'vertex'),(0x8B30,'fragment')]:
    s=shader(kind);text=data[key].encode();p=C.c_char_p(text);source(s,1,C.byref(p),None);compile_shader(s)
    ok=C.c_int();shader_iv(s,0x8B81,C.byref(ok));log=C.create_string_buffer(8192);shader_log(s,8192,None,log)
    assert ok.value,log.value.decode();attach(program,s)
link(program);ok=C.c_int();program_iv(program,0x8B82,C.byref(ok));assert ok.value,'GPU link failed'
use(program);loc=lambda n:location(program,n.encode())
vertices=(C.c_float*8)(-1,-1,1,-1,-1,1,1,1)
pos=vertex_attrib(program,b'position');enable(pos);pointer(pos,2,0x1406,0,0,vertices)
for i,name in enumerate(['panorama','portrait']):
    t=C.c_uint();texture(1,C.byref(t));active(0x84C0+i);bind(0x0DE1,t)
    for setting,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:param(0x0DE1,setting,value)
    pixel=(C.c_ubyte*4)(0,0,0,255);upload(0x0DE1,0,0x1908,1,1,0,0x1908,0x1401,pixel);u1i(loc(name),i)
t=C.c_uint();texture(1,C.byref(t));active(0x84C0+2);bind(0x8513,t)
for setting,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:param(0x8513,setting,value)
for i,face in enumerate(faces):upload(0x8515+i,0,0x1908,2048,2048,0,0x1908,0x1401,face.ctypes.data)
u1i(loc('hall'),2);u1f(loc('useHall'),1);u3f(loc('eye'),0,0,0);u3f(loc('bounds'),*data['bounds']);u3f(loc('tint'),1,1,1)
u2f(loc('fov'),1,.5625);u2f(loc('photoFov'),0,.94);u1f(loc('squish'),0)
viewport(0,0,960,540)
out=Path(sys.argv[3]);out.mkdir(parents=True,exist_ok=True)
def bilinear(image,u,v):
    h,w=image.shape[:2];x=(u*w-.5)%w;y=np.clip(v*h-.5,0,h-1)
    ix=np.floor(x).astype(int);iy=np.floor(y).astype(int);dx=(x-ix)[:,:,None];dy=(y-iy)[:,:,None]
    return ((image[iy,ix]*(1-dx)+image[iy,(ix+1)%w]*dx)*(1-dy)+(image[np.minimum(iy+1,h-1),ix]*(1-dx)+image[np.minimum(iy+1,h-1),(ix+1)%w]*dx)*dy)
results=[]
angles=[('front',0,0),('right',np.pi/2,0),('back',np.pi,0),('left',-np.pi/2,0),('roof',0,np.pi/2),('floor',0,-np.pi/2),('edge',np.pi/4,0),('edge-roof',-.7,.7)]
for name,yaw,pitch in angles:
    sy,cy=np.sin(yaw),np.cos(yaw);sp,cp=np.sin(pitch),np.cos(pitch)
    matrix=np.array([cy,0,-sy,-sy*sp,cp,-cy*sp,sy*cp,sp,cy*cp],dtype='float32')
    basis=(C.c_float*9)(*matrix);um(loc('basis'),1,0,basis);draw(5,0,4)
    pixels=np.empty((540,960,4),dtype=np.uint8);read(0,0,960,540,0x1908,0x1401,pixels.ctypes.data);actual=pixels[::-1,:,:3]
    xx,yy=np.meshgrid(2*(np.arange(960)+.5)/960-1,1-2*(np.arange(540)+.5)/540)
    directions=np.stack([xx,yy*.5625,np.ones_like(xx)],axis=2)@matrix.reshape(3,3)
    directions/=np.linalg.norm(directions,axis=2)[:,:,None]
    u=.5+np.arctan2(directions[:,:,0],directions[:,:,2])/(2*np.pi);v=.5-np.arcsin(directions[:,:,1])/np.pi
    expected=bilinear(source_image,u,v);difference=abs(actual.astype(float)-expected)
    mean=float(difference.mean());p99=float(np.quantile(difference,.99))
    assert mean<3.5 and p99<35,(name,mean,p99)
    assert error()==0
    Image.fromarray(actual).save(out/(name+'.jpg'),quality=96)
    results.append(dict(view=name,mean_error=mean,p99_error=p99))
(out/'gpu-results.json').write_text(json.dumps(results,indent=2))
print('PASS V126 GPU: real ES2 shader compiled/linked; 8 complete views including wrap, roof and floor matched the supplied sphere. Mean RGB errors:',[round(r['mean_error'],3) for r in results])
