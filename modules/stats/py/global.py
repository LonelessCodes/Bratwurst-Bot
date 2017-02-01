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

data = {{data}}

max = {{max}}

bpy.data.objects['Max'].data.body = str(max)  
bpy.data.objects['Min'].data.body = "0"
bpy.data.objects['SourceText'].data.body = "Number of Bratwurst tweets with geo tag sent in {{lastMonth}}, {{lastYear}} by country" 

for i in data:  
    material = makeMaterial("World", [1, 1 - (1 - .527231) * (i["value"] / max), 1 - (1 - 0.073239) * (i["value"] / max)])  
    object = bpy.data.objects[i["name"]]  
    setMaterial(object, material)  

bpy.data.objects['TimeTaken'].data.body = "generated in " + str(round(time.time() * 1000) - {{renderTime}}) + "ms"