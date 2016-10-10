import bpy
import time 

def withZero(number):
    if number < 10:
        return "0" + str(number)
    else:  
        return str(number)   

def makeMaterial(name, diffuse):  
    mat = bpy.data.materials.new(name=name)  
    mat.diffuse_color = diffuse  
    mat.diffuse_intensity = 1.0  
    mat.use_shadeless = True  
    return mat   

def setMaterial(ob, mat):  
    me = ob.data  
    me.materials.append(mat)   

def scale(obj, value):  
    obj.scale[0] = value  
    obj.scale[1] = value   

def changeColor(r, g, b, val, max):  
    return [1 - (1 - r) * (val / max), 1 - (1 - g) * (val / max), 1 - (1 - b) * (val / max)]   

data = {{data}}

maxTime = {{maxTime}}
maxMonth = {{maxMonth}}

bpy.data.objects["DayMax"].data.body = str(maxTime)  
bpy.data.objects["MonthMax"].data.body = str(maxMonth)  
bpy.data.objects['Title'].data.body = "Bratwurst Stats of {{lastMonth}}, {{lastYear}}" 

elem = 0  
for i in data[ "time "]:  
    material = makeMaterial( "Time ", changeColor(1, 0.527231, 0.073239, i, maxTime))  
    object = bpy.data.objects[ "DayPie.0\  withZero(elem)]  
    scale(object, (i / maxTime) / 3 * 2 + 1 / 3)  
    setMaterial(object, material)  
    elem += 1   

elem = 0  
for i in data[ "month "]:  
    material = makeMaterial( "Month ", changeColor(0.187063, 0.528533, 0.206574, i, maxMonth))  
    object = bpy.data.objects[ "MonthPie.0\  withZero(elem)]  
    scale(object, (i / maxMonth) / 3 * 2 + 1 / 3)  
    setMaterial(object, material)  
    elem += 1   

timeend =  "generated in \  str(round(time.time() * 1000) - {{renderTime}}) +  "ms "  
bpy.data.objects['TimeTaken'].data.body = timeend"