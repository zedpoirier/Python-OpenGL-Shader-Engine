import time
import datetime
import glfw
import numpy as np
import include
from OpenGL.GL import *
from OpenGL.GL.shaders import compileProgram, compileShader

# globals
screenPosX = 0
screenPosY = 0
width = 960     
height = 540
runTime = 0.0
newTime = time.time()

frag1 = "clock.frag"
frag2 = "raymarching.frag"
frag3 = "alchemy.frag"
frag = frag2

camSpeed = 0.1
camPos = np.array([0.0,10.0,10.0])
camLook = np.array([0.0,0.0,-1.0])

def makeWindow():
    global window
    if not glfw.init():
        raise Exception("glfw cannot be initialized!")
    #glfw.window_hint(glfw.TRANSPARENT_FRAMEBUFFER, glfw.TRUE)
    #glfw.window_hint(glfw.FLOATING, glfw.TRUE)
    #glfw.window_hint(glfw.MOUSE_PASSTHROUGH, glfw.TRUE)
    glfw.window_hint(glfw.DECORATED, glfw.FALSE)
    window = glfw.create_window(width, height, "Raymarching", None, None)
    if not window:
        glfw.terminate()
        raise Exception("glfw window cannot be created!")
    glfw.set_window_pos(window, screenPosX, screenPosY)
    glfw.make_context_current(window)

def inputProcess():
    global runTime # had to declare as global to not make a new local runTime var
    global frag
    global camPos
    global camLook
    global camSpeed
    if glfw.get_key(window, glfw.KEY_ESCAPE) == glfw.PRESS:
        glfw.set_window_should_close(window, GL_TRUE)
    if glfw.get_key(window, glfw.KEY_KP_0):
        runTime = 0.0
    if glfw.get_key(window, glfw.KEY_1):
        frag = frag1
    if glfw.get_key(window, glfw.KEY_2):
        frag = frag2
    if glfw.get_key(window, glfw.KEY_3):
        frag = frag3
    # camera movement
    if glfw.get_key(window, glfw.KEY_A):
        camPos[0] -= camSpeed
    if glfw.get_key(window, glfw.KEY_D):
        camPos[0] += camSpeed
    if glfw.get_key(window, glfw.KEY_LEFT_SHIFT):
        camPos[1] -= camSpeed
    if glfw.get_key(window, glfw.KEY_SPACE):
        camPos[1] +=camSpeed
    if glfw.get_key(window, glfw.KEY_W):
        camPos[2] -= camSpeed
    if glfw.get_key(window, glfw.KEY_S):
        camPos[2] += camSpeed
    # print(camPos)

def buildShader(vert, frag):
    global shader
    vertex_src = include.load_source("./", vert)
    fragment_src = include.load_source("./", frag)
    shader = compileProgram(compileShader(vertex_src, GL_VERTEX_SHADER), compileShader(fragment_src, GL_FRAGMENT_SHADER))
    glUseProgram(shader)

def setupQuad():
    vertices = [
    #    // positions    // colors      // texcoords
    	-1.0, -1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
    	-1.0,  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    	 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    	-1.0,  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    	 1.0,  1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    	 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
    indices = [0, 1, 3, 1, 2, 3]
    vertices = np.array(vertices, dtype=np.float32)
    indices = np.array(indices, dtype=np.ubyte)

    # vao is currently broken???
    vao = glGenVertexArrays(1)
    glBindVertexArray(vao)

    vbo = glGenBuffers(1)
    glBindBuffer(GL_ARRAY_BUFFER, vbo)
    glBufferData(GL_ARRAY_BUFFER, vertices.nbytes, vertices, GL_STATIC_DRAW)
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * 4, ctypes.c_void_p(0))
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * 4, ctypes.c_void_p(12))
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * 4, ctypes.c_void_p(24))
    glEnableVertexAttribArray(0)
    glEnableVertexAttribArray(1)
    glEnableVertexAttribArray(2)

    ebo = glGenBuffers(1)
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo)
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.nbytes, indices, GL_STATIC_DRAW)

makeWindow()
setupQuad()
glClearColor(0.0, 0.0, 0.0, 0.0)

while not glfw.window_should_close(window):
    # processing
    glfw.poll_events()
    prevTime = newTime
    newTime = time.time()
    runTime += newTime - prevTime
    date = datetime.datetime.now()
    inputProcess()
    buildShader("shader.vert", frag)

    # uniforms
    timeLoc = glGetUniformLocation(shader, "time")
    glUniform1f(timeLoc, runTime)
    resoLoc = glGetUniformLocation(shader, "resolution")
    glUniform2f(resoLoc, width, height)  
    dateLoc = glGetUniformLocation(shader, "date")
    glUniform4f(dateLoc, date.hour, date.minute, date.second, date.microsecond) 
    camPosLoc = glGetUniformLocation(shader, "camPos")
    glUniform3f(camPosLoc, camPos[0], camPos[1], camPos[2]) 
    camLookLoc = glGetUniformLocation(shader, "camLook")
    glUniform3f(camLookLoc, camLook[0], camLook[1], camLook[2])   

    # drawing
    glClear(GL_COLOR_BUFFER_BIT)
    glDrawArrays(GL_TRIANGLES, 0, 6)
    glfw.swap_buffers(window)


glfw.terminate()
