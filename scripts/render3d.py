# pyright: reportMissingImports=false
"""Renders the CNE Associates mark as a physical object with Blender (headless).

Usage:  blender -b --python scripts/render3d.py -- <out_dir> [samples] [cne|mark-c]
Output: <out_dir>/<kind>-3d-front.png, <kind>-3d-tilt.png, <kind>-3d-hero.png (RGBA)

  cne     the wide CNE lettermark, rendered at 2560 x 1100
  mark-c  the square C with its lens core, rendered at 2048 x 2048

Geometry comes from dist/mark-polygons.json, written by scripts/marks.mjs from scripts/mark-geometry.mjs, so
this file never carries its own copy of the letterforms. One grid unit is 0.1 Blender units. The letters are
brushed-steel plates with a rounded edge; the accent (the E's middle arm, the C's core) is lit lens-blue glass.
"""

import json
import math
import os
import sys

import bpy

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "dist/3d"
extra = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
samples = int(extra[1]) if len(extra) > 1 else 256
mark_kind = extra[2] if len(extra) > 2 else "cne"
if mark_kind not in ("cne", "mark-c"):
    raise SystemExit(f"unknown mark kind {mark_kind}: expected cne or mark-c")
os.makedirs(out_dir, exist_ok=True)

LENS = (0.184, 0.427, 0.710, 1.0)  # #2F6DB5 in linear-ish terms
# Body: brushed steel. Flat plates have little surface to catch the strips, so the alloy is lighter than
# the ink colour; under the black studio it still reads as near-black metal.
BODY = ((0.14, 0.152, 0.172, 1.0), 0.88, 0.26)  # base colour, metallic, roughness

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
WIDE = mark_kind == "cne"
LIGHT_S = 3.0 if WIDE else 1.0
scene.render.resolution_x = 2560 if WIDE else 2048
scene.render.resolution_y = 1100 if WIDE else 2048
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "16"
scene.view_settings.view_transform = (
    "Filmic"
    if "Filmic"
    in [
        i.name
        for i in bpy.types.ColorManagedViewSettings.bl_rna.properties[
            "view_transform"
        ].enum_items
    ]
    else "AgX"
)


def material(
    name,
    base,
    metallic=0.0,
    roughness=0.4,
    emission=None,
    emission_strength=0.0,
    transmission=0.0,
):
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


body_mat = material("ink-metal", BODY[0], metallic=BODY[1], roughness=BODY[2])
accent_mat = material(
    "lens-glass",
    (0.05, 0.14, 0.34, 1.0),
    metallic=0.0,
    roughness=0.05,
    emission=LENS,
    emission_strength=1.1,
    transmission=0.05,
)


def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True


def disc(name, radius, depth, mat):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=128, radius=radius, depth=depth, location=(0, 0, 0)
    )
    obj = bpy.context.active_object
    obj.name = name
    b = obj.modifiers.new("round", "BEVEL")
    b.width = min(0.3, depth / 3)
    b.segments = 10
    obj.data.materials.append(mat)
    smooth(obj)
    return obj


def extruded(name, points, centre, mat, depth=0.9, edge=0.12):
    """A filled polygon extruded into a plate with a rounded edge: solid, not a tube."""
    pts = [((p[0] - centre[0]) / 10.0, (centre[1] - p[1]) / 10.0, 0.0) for p in points]
    curve = bpy.data.curves.new(name, type="CURVE")
    curve.dimensions = "2D"
    curve.fill_mode = "BOTH"
    curve.extrude = depth / 2
    curve.bevel_depth = edge
    curve.bevel_resolution = 6
    curve.resolution_u = 1
    spline = curve.splines.new("POLY")
    spline.points.add(len(pts) - 1)
    for i, pt in enumerate(pts):
        spline.points[i].co = (pt[0], pt[1], pt[2], 1.0)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


with open(
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "dist", "mark-polygons.json"
    )
) as fh:
    POLY = json.load(fh)

parts = []
if mark_kind == "cne":
    # Logo grid 0..242 x 0..100; centre on the letters, not the viewBox.
    centre = (121, 50)
    parts.append(extruded("c", POLY["C"], centre, body_mat))
    parts.append(extruded("ne", POLY["NE"], centre, body_mat))
    parts.append(extruded("arm", POLY["ARM"], centre, accent_mat, depth=1.0))
else:
    # Square grid 0..140; the C sits at MARK_C_OFFSET and the core is a disc.
    ox, oy = POLY["MARK_C_OFFSET"]
    parts.append(
        extruded("c", [[x + ox, y + oy] for x, y in POLY["C"]], (70, 70), body_mat)
    )
    d = POLY["MARK_DOT"]
    core = disc("core", d["r"] / 10.0, 1.0, accent_mat)
    core.location = ((d["cx"] - 70) / 10.0, (70 - d["cy"]) / 10.0, 0.0)
    parts.append(core)

for part in parts:
    if part.type == "MESH":
        smooth(part)

bpy.ops.object.empty_add(location=(0, 0, 0))
root = bpy.context.active_object
root.name = "mark"
for part in parts:
    part.parent = root

world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (
    0.004,
    0.005,
    0.007,
    1,
)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0


def softbox(name, loc, rot, scale, strength, color=(1.0, 1.0, 1.0)):
    """A long emissive strip: the classic product-shot highlight on dark metal."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=tuple(c * LIGHT_S for c in loc))
    plane = bpy.context.active_object
    plane.name = name
    plane.rotation_euler = rot
    plane.scale = tuple(v * LIGHT_S for v in scale)
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


# Lighting: top strip, warm-neutral left strip, cool right strip, and a large soft key from upper front-left
# so the flat faces reflect something other than the black studio.
softbox("strip-top", (0, -8, 18), (math.radians(25), 0, 0), (24, 1.1, 1), 4.5)
softbox(
    "strip-left",
    (-20, -10, 4),
    (math.radians(90), 0, math.radians(-60)),
    (1.4, 22, 1),
    2.6,
)
softbox(
    "strip-right",
    (20, 4, 6),
    (math.radians(90), 0, math.radians(60)),
    (1.2, 20, 1),
    2.4,
    (0.75, 0.85, 1.0),
)
key = softbox(
    "key-front",
    (-18, -30, 16),
    (math.radians(62), 0, math.radians(-30)),
    (34, 34, 1),
    0.9,
    (0.86, 0.9, 1.0),
)
key.rotation_euler = (math.radians(90) - math.atan2(16, 30), 0, math.radians(-31))
scene.view_settings.exposure = 0.35 if WIDE else -0.6

# Compositor glow on the emissive accent.
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
    for attr, val in (
        ("threshold", 1.2),
        ("mix", 0.0),
        ("size", 7),
        ("strength", 0.35),
    ):
        if hasattr(glare, attr):
            setattr(glare, attr, val)
    comp = tree.nodes.new("CompositorNodeComposite")
    tree.links.new(rl.outputs["Image"], glare.inputs["Image"])
    tree.links.new(glare.outputs["Image"], comp.inputs["Image"])
except Exception as exc:  # noqa: BLE001
    print("compositor glow skipped:", exc)

bpy.ops.object.camera_add(location=(0, -26, 0))
cam = bpy.context.active_object
cam.data.lens = 85
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam


def render(name, tilt_x=0.0, tilt_z=0.0, cam_z=0.0, cam_y=-26.0):
    # The plate lies in XY; +90 on X stands it up to face the camera at tilt 0.
    root.rotation_euler = (math.radians(90 + tilt_x), 0, math.radians(tilt_z))
    cam.location = (0, cam_y, cam_z)
    cam.rotation_euler = (math.radians(90) - math.atan2(cam_z, -cam_y), 0, 0)
    scene.render.filepath = os.path.join(out_dir, name)
    bpy.ops.render.render(write_still=True)
    print("rendered", scene.render.filepath)


DIST = 104.0 if WIDE else 40.0
render(f"{mark_kind}-3d-front.png", cam_y=-DIST)
render(
    f"{mark_kind}-3d-tilt.png",
    tilt_x=-18.0,
    tilt_z=-10.0,
    cam_z=DIST * 0.08,
    cam_y=-DIST,
)
render(
    f"{mark_kind}-3d-hero.png",
    tilt_x=-38.0,
    tilt_z=-20.0,
    cam_z=DIST * 0.26,
    cam_y=-DIST * 0.88,
)
