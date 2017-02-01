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

data = [
    {
        "name": "Curve.000",
        "value": 0
    },
    {
        "name": "Curve.001",
        "value": 0
    },
    {
        "name": "Curve.002",
        "value": 0
    },
    {
        "name": "Curve.003",
        "value": 0
    },
    {
        "name": "Curve.004",
        "value": 0
    },
    {
        "name": "Curve.005",
        "value": 0
    },
    {
        "name": "Curve.006",
        "value": 0
    },
    {
        "name": "Curve.007",
        "value": 0
    },
    {
        "name": "Curve.008",
        "value": 0
    },
    {
        "name": "Curve.009",
        "value": 0
    },
    {
        "name": "Curve.010",
        "value": 0
    },
    {
        "name": "Curve.011",
        "value": 0
    },
    {
        "name": "Curve.012",
        "value": 0
    },
    {
        "name": "Curve.013",
        "value": 0
    },
    {
        "name": "Curve.014",
        "value": 0
    },
    {
        "name": "Curve.015",
        "value": 0
    },
    {
        "name": "Curve.016",
        "value": 0
    },
    {
        "name": "Curve.017",
        "value": 0
    },
    {
        "name": "Curve.018",
        "value": 0
    },
    {
        "name": "Curve.019",
        "value": 0
    },
    {
        "name": "Curve.020",
        "value": 0
    },
    {
        "name": "Curve.021",
        "value": 0
    },
    {
        "name": "Curve.022",
        "value": 0
    },
    {
        "name": "Curve.023",
        "value": 0
    },
    {
        "name": "Curve.024",
        "value": 0
    },
    {
        "name": "Curve.025",
        "value": 0
    },
    {
        "name": "Curve.026",
        "value": 0
    },
    {
        "name": "Curve.027",
        "value": 0
    },
    {
        "name": "Curve.028",
        "value": 0
    },
    {
        "name": "Curve.029",
        "value": 0
    },
    {
        "name": "Curve.030",
        "value": 0
    },
    {
        "name": "Curve.031",
        "value": 0
    },
    {
        "name": "Curve.032",
        "value": 0
    },
    {
        "name": "Curve.033",
        "value": 0
    },
    {
        "name": "Curve.034",
        "value": 0
    },
    {
        "name": "Curve.035",
        "value": 0
    },
    {
        "name": "Curve.036",
        "value": 0
    },
    {
        "name": "Curve.037",
        "value": 0
    },
    {
        "name": "Curve.038",
        "value": 0
    },
    {
        "name": "Curve.039",
        "value": 0
    },
    {
        "name": "Curve.040",
        "value": 0
    },
    {
        "name": "Curve.041",
        "value": 0
    },
    {
        "name": "Curve.042",
        "value": 0
    },
    {
        "name": "Curve.043",
        "value": 0
    },
    {
        "name": "Curve.044",
        "value": 0
    },
    {
        "name": "Curve.045",
        "value": 0
    },
    {
        "name": "Curve.046",
        "value": 0
    },
    {
        "name": "Curve.047",
        "value": 0
    },
    {
        "name": "Curve.048",
        "value": 0
    },
    {
        "name": "Curve.049",
        "value": 0
    },
    {
        "name": "Curve.050",
        "value": 0
    },
    {
        "name": "Curve.051",
        "value": 0
    },
    {
        "name": "Curve.052",
        "value": 0
    },
    {
        "name": "Curve.053",
        "value": 0
    },
    {
        "name": "Curve.054",
        "value": 0
    },
    {
        "name": "Curve.055",
        "value": 0
    },
    {
        "name": "Curve.056",
        "value": 0
    },
    {
        "name": "Curve.057",
        "value": 0
    },
    {
        "name": "Curve.058",
        "value": 0
    },
    {
        "name": "Curve.059",
        "value": 0
    },
    {
        "name": "Curve.060",
        "value": 0
    },
    {
        "name": "Curve.061",
        "value": 0
    },
    {
        "name": "Curve.062",
        "value": 0
    },
    {
        "name": "Curve.063",
        "value": 0
    },
    {
        "name": "Curve.064",
        "value": 0
    },
    {
        "name": "Curve.065",
        "value": 0
    },
    {
        "name": "Curve.066",
        "value": 0
    },
    {
        "name": "Curve.067",
        "value": 0
    },
    {
        "name": "Curve.068",
        "value": 0
    },
    {
        "name": "Curve.069",
        "value": 0
    },
    {
        "name": "Curve.070",
        "value": 0
    },
    {
        "name": "Curve.071",
        "value": 0
    },
    {
        "name": "Curve.072",
        "value": 0
    },
    {
        "name": "Curve.073",
        "value": 0
    },
    {
        "name": "Curve.074",
        "value": 0
    },
    {
        "name": "Curve.075",
        "value": 0
    },
    {
        "name": "Curve.076",
        "value": 0
    },
    {
        "name": "Curve.077",
        "value": 0
    },
    {
        "name": "Curve.078",
        "value": 0
    },
    {
        "name": "Curve.079",
        "value": 0
    },
    {
        "name": "Curve.080",
        "value": 0
    },
    {
        "name": "Curve.081",
        "value": 0
    },
    {
        "name": "Curve.082",
        "value": 0
    },
    {
        "name": "Curve.083",
        "value": 0
    },
    {
        "name": "Curve.084",
        "value": 0
    },
    {
        "name": "Curve.085",
        "value": 0
    },
    {
        "name": "Curve.086",
        "value": 0
    },
    {
        "name": "Curve.087",
        "value": 0
    },
    {
        "name": "Curve.088",
        "value": 0
    },
    {
        "name": "Curve.089",
        "value": 0
    },
    {
        "name": "Curve.090",
        "value": 0
    },
    {
        "name": "Curve.091",
        "value": 0
    },
    {
        "name": "Curve.092",
        "value": 0
    },
    {
        "name": "Curve.093",
        "value": 0
    },
    {
        "name": "Curve.094",
        "value": 0
    },
    {
        "name": "Curve.095",
        "value": 0
    },
    {
        "name": "Curve.096",
        "value": 0
    },
    {
        "name": "Curve.097",
        "value": 0
    },
    {
        "name": "Curve.098",
        "value": 0
    },
    {
        "name": "Curve.099",
        "value": 0
    },
    {
        "name": "Curve.100",
        "value": 0
    },
    {
        "name": "Curve.101",
        "value": 0
    },
    {
        "name": "Curve.102",
        "value": 0
    },
    {
        "name": "Curve.103",
        "value": 0
    },
    {
        "name": "Curve.104",
        "value": 0
    },
    {
        "name": "Curve.105",
        "value": 0
    },
    {
        "name": "Curve.106",
        "value": 0
    },
    {
        "name": "Curve.107",
        "value": 0
    },
    {
        "name": "Curve.108",
        "value": 0
    },
    {
        "name": "Curve.109",
        "value": 0
    },
    {
        "name": "Curve.110",
        "value": 0
    },
    {
        "name": "Curve.111",
        "value": 0
    },
    {
        "name": "Curve.112",
        "value": 0
    },
    {
        "name": "Curve.113",
        "value": 0
    },
    {
        "name": "Curve.114",
        "value": 0
    },
    {
        "name": "Curve.115",
        "value": 0
    },
    {
        "name": "Curve.116",
        "value": 0
    },
    {
        "name": "Curve.117",
        "value": 0
    },
    {
        "name": "Curve.118",
        "value": 0
    },
    {
        "name": "Curve.119",
        "value": 0
    },
    {
        "name": "Curve.120",
        "value": 0
    },
    {
        "name": "Curve.121",
        "value": 0
    },
    {
        "name": "Curve.122",
        "value": 0
    },
    {
        "name": "Curve.123",
        "value": 0
    },
    {
        "name": "Curve.124",
        "value": 0
    },
    {
        "name": "Curve.125",
        "value": 0
    },
    {
        "name": "Curve.126",
        "value": 0
    },
    {
        "name": "Curve.127",
        "value": 0
    },
    {
        "name": "Curve.128",
        "value": 0
    },
    {
        "name": "Curve.129",
        "value": 0
    },
    {
        "name": "Curve.130",
        "value": 0
    },
    {
        "name": "Curve.131",
        "value": 0
    },
    {
        "name": "Curve.132",
        "value": 0
    },
    {
        "name": "Curve.133",
        "value": 0
    },
    {
        "name": "Curve.134",
        "value": 0
    },
    {
        "name": "Curve.135",
        "value": 0
    },
    {
        "name": "Curve.136",
        "value": 0
    },
    {
        "name": "Curve.137",
        "value": 0
    },
    {
        "name": "Curve.138",
        "value": 0
    },
    {
        "name": "Curve.139",
        "value": 0
    },
    {
        "name": "Curve.140",
        "value": 0
    },
    {
        "name": "Curve.141",
        "value": 0
    },
    {
        "name": "Curve.142",
        "value": 0
    },
    {
        "name": "Curve.143",
        "value": 0
    },
    {
        "name": "Curve.144",
        "value": 0
    },
    {
        "name": "Curve.145",
        "value": 0
    },
    {
        "name": "Curve.146",
        "value": 0
    },
    {
        "name": "Curve.147",
        "value": 0
    },
    {
        "name": "Curve.148",
        "value": 0
    },
    {
        "name": "Curve.149",
        "value": 0
    },
    {
        "name": "Curve.150",
        "value": 0
    },
    {
        "name": "Curve.151",
        "value": 0
    },
    {
        "name": "Curve.152",
        "value": 0
    },
    {
        "name": "Curve.153",
        "value": 0
    },
    {
        "name": "Curve.154",
        "value": 0
    },
    {
        "name": "Curve.155",
        "value": 0
    },
    {
        "name": "Curve.156",
        "value": 0
    },
    {
        "name": "Curve.157",
        "value": 0
    },
    {
        "name": "Curve.158",
        "value": 0
    },
    {
        "name": "Curve.159",
        "value": 0
    },
    {
        "name": "Curve.160",
        "value": 0
    },
    {
        "name": "Curve.161",
        "value": 0
    },
    {
        "name": "Curve.162",
        "value": 0
    },
    {
        "name": "Curve.163",
        "value": 0
    },
    {
        "name": "Curve.164",
        "value": 0
    },
    {
        "name": "Curve.165",
        "value": 0
    },
    {
        "name": "Curve.166",
        "value": 0
    },
    {
        "name": "Curve.167",
        "value": 0
    },
    {
        "name": "Curve.168",
        "value": 0
    },
    {
        "name": "Curve.169",
        "value": 0
    },
    {
        "name": "Curve.170",
        "value": 0
    },
    {
        "name": "Curve.171",
        "value": 0
    },
    {
        "name": "Curve.172",
        "value": 0
    },
    {
        "name": "Curve.173",
        "value": 0
    },
    {
        "name": "Curve.174",
        "value": 0
    },
    {
        "name": "Curve.175",
        "value": 0
    }
]

max = 0

bpy.data.objects['Max'].data.body = str(max)  
bpy.data.objects['Min'].data.body = "0"
bpy.data.objects['SourceText'].data.body = "Number of Bratwurst tweets with geo tag sent in 12, 2016 by country" 

for i in data:  
    material = makeMaterial("World", [1, 1 - (1 - .527231) * (i["value"] / max), 1 - (1 - 0.073239) * (i["value"] / max)])  
    object = bpy.data.objects[i["name"]]  
    setMaterial(object, material)  

bpy.data.objects['TimeTaken'].data.body = "generated in " + str(round(time.time() * 1000) - 1485899346499) + "ms"