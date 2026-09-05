# pyright: reportMissingImports=false
"""Renders the Lenswright aperture mark as a physical object with Blender (headless).

Usage:  blender -b --python scripts/render3d.py -- <out_dir> [samples]
Output: <out_dir>/aperture-3d-front.png, aperture-3d-tilt.png, aperture-3d-hero.png (RGBA, 2048px)

Geometry follows tokens/tokens.json: ring r56 stroke 12 (outer 62, inner 50), slit 72x18, in mark units / 10.
Materials: ring = dark anodised metal (ink), slit = lit glass (lens colour). Two cameras: straight-on and tilted.
"""

import math
import os
import sys

import bpy

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "dist/3d"
samples = int(sys.argv[sys.argv.index("--") + 2]) if "--" in sys.argv and len(sys.argv) > sys.argv.index("--") + 2 else 256
os.makedirs(out_dir, exist_ok=True)

INK = (0.012, 0.015, 0.02, 1.0)  # deep anodised, reads as #0E1116 under studio light
LENS = (0.184, 0.427, 0.710, 1.0)  # #2F6DB5 in linear-ish terms
LENS_GLOW = (0.436, 0.627, 0.878, 1.0)  # #6FA0E0

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = "GPU"
except Exception as exc:  # noqa: BLE001
    print("GPU setup failed, using CPU:", exc)
scene.cycles.samples = samples
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = 2048
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "16"
scene.view_settings.view_transform = "Filmic" if "Filmic" in [i.name for i in bpy.types.ColorManagedViewSettings.bl_rna.properties["view_transform"].enum_items] else "AgX"


def material(name, base, metallic=0.0, roughness=0.4, emission=None, emission_strength=0.0, transmission=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return m


ring_mat = material("ink-metal", INK, metallic=0.85, roughness=0.34)
slit_mat = material("lens-glass", (0.05, 0.14, 0.34, 1.0), metallic=0.0, roughness=0.05, emission=LENS, emission_strength=1.1, transmission=0.05)

# Ring: outer cylinder minus inner cylinder, then bevel for a machined edge.
bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=6.2, depth=1.2, location=(0, 0, 0))
ring = bpy.context.active_object
ring.name = "ring"
bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=5.0, depth=2.0, location=(0, 0, 0))
inner = bpy.context.active_object
inner.name = "inner"
boolean = ring.modifiers.new("cut", "BOOLEAN")
boolean.operation = "DIFFERENCE"
boolean.object = inner
bpy.context.view_layer.objects.active = ring
bpy.ops.object.modifier_apply(modifier="cut")
bpy.data.objects.remove(inner, do_unlink=True)
bevel = ring.modifiers.new("bevel", "BEVEL")
bevel.width = 0.34
bevel.segments = 10
ring.data.materials.append(ring_mat)
for poly in ring.data.polygons:
    poly.use_smooth = True

# Slit: rounded bar 7.2 x 1.8 x 0.9, fully rounded ends via bevel.
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
slit = bpy.context.active_object
slit.name = "slit"
slit.scale = (7.2, 1.8, 0.9)
bpy.ops.object.transform_apply(scale=True)
sb = slit.modifiers.new("round", "BEVEL")
sb.width = 0.44
sb.segments = 12
slit.data.materials.append(slit_mat)
for poly in slit.data.polygons:
    poly.use_smooth = True

# Group so the whole mark can be tilted.
bpy.ops.object.empty_add(location=(0, 0, 0))
root = bpy.context.active_object
root.name = "mark"
ring.parent = root
slit.parent = root

# Lighting: soft key from upper left, cool rim from behind right, large top fill.
def area(name, loc, rot, energy, size, color=(1, 1, 1)):
    bpy.ops.object.light_add(type="AREA", location=loc)
    lamp = bpy.context.active_object
    lamp.name = name
    lamp.rotation_euler = rot
    lamp.data.energy = energy
    lamp.data.size = size
    lamp.data.color = color
    return lamp


world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.005, 0.007, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0


def softbox(name, loc, rot, scale, strength, color=(1.0, 1.0, 1.0)):
    """A long emissive strip: the classic product-shot highlight on dark metal."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    plane = bpy.context.active_object
    plane.name = name
    plane.rotation_euler = rot
    plane.scale = scale
    m = bpy.data.materials.new(name + "-emit")
    m.use_nodes = True
    nodes = m.node_tree.nodes
    nodes.clear()
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (*color, 1.0)
    emit.inputs["Strength"].default_value = strength
    outn = nodes.new("ShaderNodeOutputMaterial")
    m.node_tree.links.new(emit.outputs["Emission"], outn.inputs["Surface"])
    plane.data.materials.append(m)
    plane.visible_camera = False
    return plane


softbox("strip-top", (0, -8, 18), (math.radians(25), 0, 0), (24, 1.1, 1), 4.5)
softbox("strip-left", (-20, -10, 4), (math.radians(90), 0, math.radians(-60)), (1.4, 22, 1), 2.6)
softbox("strip-right", (20, 4, 6), (math.radians(90), 0, math.radians(60)), (1.2, 20, 1), 2.4, (0.75, 0.85, 1.0))
scene.view_settings.exposure = -0.6

# Compositor glow on the emissive slit.
try:
    scene.use_nodes = True
    tree = scene.node_tree
    for n in list(tree.nodes):
        tree.nodes.remove(n)
    rl = tree.nodes.new("CompositorNodeRLayers")
    glare = tree.nodes.new("CompositorNodeGlare")
    try:
        glare.glare_type = "BLOOM"
    except Exception:  # noqa: BLE001
        glare.glare_type = "FOG_GLOW"
    for attr, val in (("threshold", 1.2), ("mix", 0.0), ("size", 7), ("strength", 0.35)):
        if hasattr(glare, attr):
            setattr(glare, attr, val)
    comp = tree.nodes.new("CompositorNodeComposite")
    tree.links.new(rl.outputs["Image"], glare.inputs["Image"])
    tree.links.new(glare.outputs["Image"], comp.inputs["Image"])
except Exception as exc:  # noqa: BLE001
    print("compositor glow skipped:", exc)

# Camera.
bpy.ops.object.camera_add(location=(0, -26, 0))
cam = bpy.context.active_object
cam.data.lens = 85
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam


def render(name, tilt_x=0.0, tilt_z=0.0, cam_z=0.0, cam_y=-26.0):
    root.rotation_euler = (math.radians(90 + tilt_x), 0, math.radians(tilt_z))  # ring faces the camera at tilt 0
    cam.location = (0, cam_y, cam_z)
    cam.rotation_euler = (math.radians(90) - math.atan2(cam_z, -cam_y), 0, 0)
    scene.render.filepath = os.path.join(out_dir, name)
    bpy.ops.render.render(write_still=True)
    print("rendered", scene.render.filepath)


render("aperture-3d-front.png", cam_y=-40.0)
render("aperture-3d-tilt.png", tilt_x=-22.0, tilt_z=-14.0, cam_z=3.0, cam_y=-40.0)
render("aperture-3d-hero.png", tilt_x=-48.0, tilt_z=-26.0, cam_z=10.0, cam_y=-34.0)
