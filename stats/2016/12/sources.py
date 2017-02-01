import bpy
import time

data = {
    "value": [
        0,
        0,
        0,
        0,
        0,
        0
    ],
    "name": [
        "",
        "",
        "",
        "",
        "",
        ""
    ]
}

bpy.data.objects['SourcesMax'].data.body = str(round(data["value"][0], 1)) + "%"
bpy.data.objects['SourcesMiddle'].data.body = str(round(data["value"][0] / 2, 1)) + "%"
bpy.data.objects['SourceText'].data.body = "Most used apps to tweet about Bratwurst in 12, 2016"

for i in range(6):
    if data["name"][i]:
        bpy.data.objects['BarText.00' + str(i)].data.body = data["name"][i]
        bpy.data.objects['Bar.00' + str(i)].scale[1] = data["value"][i] / data["value"][0]

time = "generated in " + str(round(time.time() * 1000) - 1485899335168) + "ms"
bpy.data.objects['TimeTaken'].data.body = time