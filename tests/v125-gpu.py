#!/usr/bin/env python3
"""Render the actual WebGL fragment shader in a surfaceless EGL ES2 context.
Run v125.cjs with V125_GPU_CAPTURE=FILE, then pass FILE to this test.
This tests GPU pixels, not browser layout. Requires Mesa EGL, Pillow, numpy.
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
surface = egl('eglCreatePbufferSurface',C.c_void_p,[C.c_void_p,C.c_void_p,C.c_void_p])(display,config,(C.c_int*5)(0x3057,33,0x3056,65,0x3038))
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
base = np.asarray(Image.open(ROOT/'assets/hq/panorama125/hall.webp').convert('RGBA'))
detail = np.asarray(Image.open(ROOT/'assets/hq/panorama125/details.webp').convert('RGBA')).copy()
detail[:,:,:3] = np.round(detail[:,:,:3].astype(float)*detail[:,:,3:]/255).astype(np.uint8)

def sample(image, u, v):
    h,w=image.shape[:2];x=np.clip(u*w-.5,0,w-1);y=np.clip(v*h-.5,0,h-1)
    ix,iy=int(x),int(y);dx,dy=x-ix,y-iy
    return ((image[iy,ix]*(1-dx)+image[iy,min(ix+1,w-1)]*dx)*(1-dy)+
            (image[min(iy+1,h-1),ix]*(1-dx)+image[min(iy+1,h-1),min(ix+1,w-1)]*dx)*dy)

tested=0
for capture in data['captures']:
    program=create_program()
    for kind,key in [(0x8B31,'vertex'),(0x8B30,'fragment')]:
        s=shader(kind);text=capture[key].encode();p=C.c_char_p(text);source(s,1,C.byref(p),None);compile_shader(s)
        ok=C.c_int();shader_iv(s,0x8B81,C.byref(ok))
        log=C.create_string_buffer(8192);shader_log(s,8192,None,log)
        assert ok.value,log.value.decode();attach(program,s)
    link(program);ok=C.c_int();program_iv(program,0x8B82,C.byref(ok));assert ok.value,'GPU link failed'
    use(program);loc=lambda n:location(program,n.encode())
    vertices=(C.c_float*8)(-1,-1,1,-1,-1,1,1,1)
    pos=vertex_attrib(program,b'position');enable(pos);pointer(pos,2,0x1406,0,0,vertices)
    for i,(name,image) in enumerate([('panorama',base),('portrait',base[:1,:1]),('details',detail)]):
        t=C.c_uint();texture(1,C.byref(t));active(0x84C0+i);bind(0x0DE1,t)
        for setting,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:param(0x0DE1,setting,value)
        pixels=np.ascontiguousarray(image);upload(0x0DE1,0,0x1908,pixels.shape[1],pixels.shape[0],0,0x1908,0x1401,pixels.ctypes.data);u1i(loc(name),i)
    n=1 if capture['vectors']==16 else len(data['tiles'])
    for i,tile in enumerate(data['tiles'][:n]):u4f(loc(f'detailUV[{i}]'),*tile['uv']);u4f(loc(f'detailAtlas[{i}]'),*tile['atlas'])
    u3f(loc('eye'),0,0,0);u3f(loc('bounds'),*data['bounds']);u3f(loc('tint'),1,1,1)
    u2f(loc('fov'),.434,.94);u2f(loc('photoFov'),0,.94);u1f(loc('squish'),0);u1f(loc('hasDetails'),1)
    viewport(0,0,33,65)
    for tile in data['tiles'][:n]:
        # Include interior and alpha edges to catch atlas bleed/dark borders.
        for tx,ty in [(.5,.5),(.02,.5),(.5,.015),(.99,.99)]:
            u=tile['uv'][0]+tile['uv'][2]*tx;v=tile['uv'][1]+tile['uv'][3]*ty
            yaw=(u-.5)*2*np.pi;pitch=(.5-v)*np.pi/1.36;sy,cy=np.sin(yaw),np.cos(yaw);sp,cp=np.sin(pitch),np.cos(pitch)
            basis=(C.c_float*9)(cy,0,-sy,-sy*sp,cp,-cy*sp,sy*cp,sp,cy*cp)
            um(loc('basis'),1,0,basis);draw(5,0,4)
            pixel=(C.c_ubyte*4)();read(16,32,1,1,0x1908,0x1401,pixel)
            expected=sample(base,u,v)[:3]
            for layer in data['tiles'][:n]:
                x=(u-layer['uv'][0])/layer['uv'][2];y=(v-layer['uv'][1])/layer['uv'][3]
                if 0<=x<=1 and 0<=y<=1:
                    c=sample(detail,layer['atlas'][0]+x*layer['atlas'][2],layer['atlas'][1]+y*layer['atlas'][3]);expected=expected*(1-c[3]/255)+c[:3]
            assert np.max(abs(np.asarray(pixel[:3],float)-expected))<4,(tile['id'],tx,ty,list(pixel),expected)
            assert error()==0;tested+=1
print(f'PASS V125 GPU: both actual shader variants compiled/linked; {tested} native RGB/alpha samples matched independent source sampling, including detail edges.')
