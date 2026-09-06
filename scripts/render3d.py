# pyright: reportMissingImports=false
"""Renders the CNE Associates aperture mark as a physical object with Blender (headless).

Usage:  blender -b --python scripts/render3d.py -- <out_dir> [samples] [aperture|iris|focal]
Output: <out_dir>/aperture-3d-front.png, aperture-3d-tilt.png, aperture-3d-hero.png (RGBA, 2048px)

Geometry follows tokens/tokens.json: ring r56 stroke 12 (outer 62, inner 50), slit 72x18, in mark units / 10.
Materials: ring = dark anodised metal (ink), slit = lit glass (lens colour). Two cameras: straight-on and tilted.
"""

import collections
import json
import math
import os
import sys

import bpy

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "dist/3d"
extra = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
samples = int(extra[1]) if len(extra) > 1 else 256
mark_kind = (
    extra[2] if len(extra) > 2 else "aperture"
)  # aperture | iris | focal | aperture-c | c-stack
os.makedirs(out_dir, exist_ok=True)

INK = (0.012, 0.015, 0.02, 1.0)  # deep anodised, reads as #0E1116 under studio light
LENS = (0.184, 0.427, 0.710, 1.0)  # #2F6DB5 in linear-ish terms
LENS_GLOW = (0.436, 0.627, 0.878, 1.0)  # #6FA0E0

# Per-mark body material: (base colour, metallic, roughness). The monograms are stroked forms with far less
# surface than the solid ring, so they need a lighter alloy to separate from the black studio.
_DARK_ALLOY = ((0.03, 0.036, 0.046, 1.0), 0.75, 0.38)
_BRUSHED_STEEL = ((0.14, 0.152, 0.172, 1.0), 0.88, 0.26)
METAL = collections.defaultdict(lambda: _DARK_ALLOY)
METAL["aperture"] = (INK, 0.85, 0.34)
METAL["aperture-c"] = _BRUSHED_STEEL
METAL["c-stack"] = _BRUSHED_STEEL
METAL["cne"] = _BRUSHED_STEEL
METAL["mark-c"] = _BRUSHED_STEEL

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


ring_mat = material(
    "ink-metal",
    METAL[mark_kind][0],
    metallic=METAL[mark_kind][1],
    roughness=METAL[mark_kind][2],
)
slit_mat = material(
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


def ring_object(outer=6.2, inner_r=5.0, depth=1.2):
    """Outer cylinder minus inner cylinder, then a bevel for a machined edge."""
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=256, radius=outer, depth=depth, location=(0, 0, 0)
    )
    ring = bpy.context.active_object
    ring.name = "ring"
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=256, radius=inner_r, depth=depth + 1, location=(0, 0, 0)
    )
    inner = bpy.context.active_object
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
    smooth(ring)
    return ring


def bar(name, size, location=(0, 0, 0), rot_z=0.0, mat=None, round_w=0.44):
    """A rounded bar: cube scaled to size with a heavy bevel, so the ends and edges read as machined."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    obj.location = location
    obj.rotation_euler = (0, 0, rot_z)
    b = obj.modifiers.new("round", "BEVEL")
    b.width = round_w
    b.segments = 12
    obj.data.materials.append(mat or ring_mat)
    smooth(obj)
    return obj


def arc_tube(name, radius, start_deg, end_deg, thickness, mat, segments=128):
    """A stroked arc with round caps: a poly curve swept by a circular bevel."""
    curve = bpy.data.curves.new(name, type="CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = thickness / 2
    curve.bevel_resolution = 12
    curve.use_fill_caps = True
    spline = curve.splines.new("POLY")
    spline.points.add(segments - 1)
    for i in range(segments):
        a = math.radians(start_deg + (end_deg - start_deg) * i / (segments - 1))
        spline.points[i].co = (radius * math.cos(a), radius * math.sin(a), 0.0, 1.0)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def disc(name, radius, depth, mat, z=0.0):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=128, radius=radius, depth=depth, location=(0, 0, z)
    )
    obj = bpy.context.active_object
    obj.name = name
    b = obj.modifiers.new("round", "BEVEL")
    b.width = min(0.3, depth / 3)
    b.segments = 10
    obj.data.materials.append(mat)
    smooth(obj)
    return obj


# Mark geometry comes from dist/mark-polygons.json, written by scripts/marks.mjs from mark-geometry.mjs,
# so this file never carries its own copy of the letterforms. Grid is 0..320 x 0..100 for the logo, 0..140 for
# the square mark; one grid unit is 0.1 Blender units.

with open(
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "dist", "mark-polygons.json"
    )
) as fh:
    POLY = json.load(fh)


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


parts = []
if mark_kind == "cne":
    centre = (121, 50)
    parts.append(extruded("c", POLY["C"], centre, ring_mat))
    parts.append(extruded("ne", POLY["NE"], centre, ring_mat))
    parts.append(extruded("arm", POLY["ARM"], centre, slit_mat, depth=1.0))
elif mark_kind == "mark-c":
    ox, oy = POLY["MARK_C_OFFSET"]
    parts.append(
        extruded("c", [[x + ox, y + oy] for x, y in POLY["C"]], (70, 70), ring_mat)
    )
    d = POLY["MARK_DOT"]
    core = disc("core", d["r"] / 10.0, 1.0, slit_mat)
    core.location = ((d["cx"] - 70) / 10.0, (70 - d["cy"]) / 10.0, 0.0)
    parts.append(core)
elif mark_kind == "aperture-c":
    # The initial as an open ring with a lit core (mark units / 10).
    parts.append(arc_tube("c", 4.8, 42, 318, 1.6, ring_mat))
    parts.append(disc("core", 1.3, 0.9, slit_mat))
elif mark_kind == "c-stack":
    # The open C holding three layers, the middle one lit.
    parts.append(arc_tube("c", 5.2, 52, 308, 1.4, ring_mat))
    parts.append(bar("layer-top", (4.4, 0.9, 0.8), (0, 1.05, 0), 0.0, ring_mat, 0.3))
    parts.append(bar("layer-mid", (6.0, 0.9, 0.8), (0, 0.0, 0), 0.0, slit_mat, 0.3))
    parts.append(bar("layer-bot", (4.4, 0.9, 0.8), (0, -1.05, 0), 0.0, ring_mat, 0.3))
elif mark_kind == "aperture":
    parts.append(ring_object())
    parts.append(bar("slit", (7.2, 1.8, 0.9), mat=slit_mat))
elif mark_kind == "focal":
    parts.append(ring_object())
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=128, radius=1.7, depth=0.9, location=(0, 0, 0)
    )
    core = bpy.context.active_object
    core.name = "core"
    cb = core.modifiers.new("round", "BEVEL")
    cb.width = 0.3
    cb.segments = 10
    core.data.materials.append(slit_mat)
    smooth(core)
    parts.append(core)
elif mark_kind == "iris":
    # Six blades: each side of a hexagon (r 3.0) extended 3.4 past one vertex, matching the SVG.
    inner_r = 3.0
    for i in range(6):
        a1 = math.radians(i * 60 - 90)
        a2 = math.radians(i * 60 - 30)
        x1, y1 = inner_r * math.cos(a1), inner_r * math.sin(a1)
        x2, y2 = inner_r * math.cos(a2), inner_r * math.sin(a2)
        dx, dy = x2 - x1, y2 - y1
        ln = math.hypot(dx, dy)
        xe, ye = x2 + dx / ln * 3.4, y2 + dy / ln * 3.4
        length = math.hypot(xe - x1, ye - y1)
        mid = ((x1 + xe) / 2, (y1 + ye) / 2, 0)
        parts.append(
            bar(
                f"blade{i}",
                (length + 0.4, 1.1, 0.8),
                mid,
                math.atan2(ye - y1, xe - x1),
                ring_mat,
                0.36,
            )
        )
    # The lit opening: a hexagonal glass plate set slightly behind the blades.
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=6, radius=2.45, depth=0.5, location=(0, 0, -0.45)
    )
    plate = bpy.context.active_object
    plate.name = "opening"
    plate.rotation_euler = (0, 0, math.radians(-90 + 30))
    pb = plate.modifiers.new("round", "BEVEL")
    pb.width = 0.12
    pb.segments = 6
    plate.data.materials.append(slit_mat)
    smooth(plate)
    parts.append(plate)
else:
    raise SystemExit(f"unknown mark kind {mark_kind}")

# Group so the whole mark can be tilted.
for part in parts:
    if part.type == "MESH":
        smooth(part)

bpy.ops.object.empty_add(location=(0, 0, 0))
root = bpy.context.active_object
root.name = "mark"
for part in parts:
    part.parent = root


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
# Flat-faced marks need a large soft key from upper front-left, or their faces only reflect the black studio.
if mark_kind != "aperture":
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

# Camera.
bpy.ops.object.camera_add(location=(0, -26, 0))
cam = bpy.context.active_object
cam.data.lens = 85
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam


def render(name, tilt_x=0.0, tilt_z=0.0, cam_z=0.0, cam_y=-26.0):
    root.rotation_euler = (
        math.radians(90 + tilt_x),
        0,
        math.radians(tilt_z),
    )  # ring faces the camera at tilt 0
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
