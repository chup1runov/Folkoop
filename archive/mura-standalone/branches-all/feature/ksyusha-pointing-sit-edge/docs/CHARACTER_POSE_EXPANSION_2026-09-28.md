# Ksyusha pose expansion — acceptance record

Date: 2026-09-28  
Issue: #23

## Accepted candidate vocabulary

- point-left
- point-right
- point-up
- point-down
- sit-edge

All five source images are 192×208 8-bit RGBA PNGs. Direction was visually
checked after generation. The initial point-right result pointed left and was
rejected; the repository candidate is the corrected pass.

## Sit-edge contract

The source image contains the seated body posture only: hips flexed, knees bent
and lower legs hanging. It intentionally does not draw a bench or button.
The host surface supplies the actual visible edge. This allows the same pose to
sit on a FOLKOOP control or a Mura desktop/window surface without rendering two
competing ledges.

## Provenance

The five images are new AI-assisted first-party assets generated with Adobe
Firefly from the established Mura Ksyusha visual identity and cleaned/reviewed
before import. They are not recovered historical source art.

## Gates before downstream completion

1. Character Pack loader/validator and standard Mura tests must pass.
2. The embedded bundle must be byte-identical to the loose PNG sources.
3. FOLKOOP must inspect the poses around its real 86–110 px helper size.
4. Pointing must align with real targets without the temporary orange pointer.
5. sit-edge must visibly meet the actual host edge with legs below it.

Passing repository CI proves the file/runtime contract, not artistic identity by
itself.
