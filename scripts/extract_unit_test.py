import openpyxl
import urllib.request
import json
import os
import re
import subprocess

wb = openpyxl.load_workbook(r'C:\Users\M RIZKY\Desktop\Unit Test.xlsx', data_only=True)
sheet = wb.active

SUPABASE_URL = 'https://bjkjahetvxnimchkunqp.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa2phaGV0dnhuaW1jaGt1bnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNTM3NiwiZXhwIjoyMTA2NjAxMzc2fQ.EQ3-lgaVS95tsAgDbEDCgf9w7jWV8r-MHXoaZunTYqE'

# 1. Map all images by row
images_by_row = {}
for i, img in enumerate(sheet._images):
    from_marker = getattr(img.anchor, '_from', None)
    if from_marker:
        r = from_marker.row + 1
        col = from_marker.col + 1
        ext = getattr(img, 'format', 'png')
        filename = f'item_row_{r}_col_{col}_{i}.{ext}'
        public_url = f'{SUPABASE_URL}/storage/v1/object/public/bom-images/{filename}'
        if r not in images_by_row:
            images_by_row[r] = []
        images_by_row[r].append(public_url)

print(f'Mapped {len(images_by_row)} rows with images.')

item_start_rows = [
    26, 40, 59, 76, 93, 118, 143, 160, 177, 188, 208, 236, 261,
    339, 375, 390, 406, 422, 430, 443, 455, 466, 476, 486, 506,
    518, 527, 541, 555, 579, 592, 610, 627, 650, 679, 692, 710, 725, 766
]

seen_codes = {}
extracted_items = []

for idx, start_r in enumerate(item_start_rows):
    end_r = item_start_rows[idx + 1] - 1 if idx + 1 < len(item_start_rows) else min(start_r + 30, sheet.max_row)

    c3 = sheet.cell(start_r, 3).value
    c8 = sheet.cell(start_r, 8).value
    c4 = sheet.cell(start_r, 4).value
    c5 = sheet.cell(start_r, 5).value
    c6 = sheet.cell(start_r, 6).value
    c7 = sheet.cell(start_r, 7).value
    c10 = sheet.cell(start_r, 10).value
    c11 = sheet.cell(start_r, 11).value
    c12 = sheet.cell(start_r, 12).value
    c19 = sheet.cell(start_r, 19).value
    c20 = sheet.cell(start_r, 20).value
    c21 = sheet.cell(start_r, 21).value

    raw_code = str(c3).strip() if c3 else f'ITEM-{idx+1}'

    # Handle google drive link as code
    if 'drive.google.com' in raw_code:
        if not c19:
            c19 = raw_code
        raw_code = f'DOOR-SET-{start_r}' if 'door' in str(c8).lower() else f'ITEM-{start_r}'

    # Clean code: single line, alphanumeric with dashes
    code = re.sub(r'[\r\n]+', '-', raw_code).strip()
    code = re.sub(r'\s+', '-', code)

    # Ensure unique code
    if code in seen_codes:
        seen_codes[code] += 1
        code = f'{code}-REV{seen_codes[code]}'
    else:
        seen_codes[code] = 0

    name = str(c8).strip() if c8 else f'Component {code}'
    name = name.split('\n')[0].strip()

    try:
        qty = int(float(c4)) if c4 else 1
    except:
        qty = 1
    if qty <= 0:
        qty = 1

    try:
        ov = int(float(c5)) if c5 else 0
    except:
        ov = 0

    try:
        bv = int(float(c6)) if c6 else 0
    except:
        bv = 0

    try:
        ol = float(c10) if c10 else None
        ow = float(c11) if c11 else None
        oh = float(c12) if c12 else None
    except:
        ol, ow, oh = None, None, None

    # Photo URL
    photo_urls = images_by_row.get(start_r, [])
    photo_url = photo_urls[0] if photo_urls else None

    # Links & Notes
    dwg_link = str(c19).strip() if c19 and 'http' in str(c19) else None
    spec_link = str(c21).strip() if c21 and 'http' in str(c21) else None
    notes = str(c7).strip() if c7 else None

    solids = []
    panels = []
    hardware = []
    custom = []
    boxes = []

    # Sawmill counters
    belah_m3 = {'belah_25': 0.0, 'belah_40': 0.0, 'belah_45': 0.0, 'belah_50': 0.0}

    for r in range(start_r + 1, end_r + 1):
        row_c7 = sheet.cell(r, 7).value or ''
        row_c8 = sheet.cell(r, 8).value or ''
        row_l = sheet.cell(r, 10).value
        row_w = sheet.cell(r, 11).value
        row_t = sheet.cell(r, 12).value
        row_q = sheet.cell(r, 13).value
        row_rate = sheet.cell(r, 22).value
        row_tot = sheet.cell(r, 23).value

        c7_str = str(row_c7).upper()
        c8_str = str(row_c8).upper()

        # Skip total / subtotal rows
        if any(x in c8_str for x in ['MISC', 'TOTAL', 'LABOR PRODUKSI', 'LABOR PRODUCTION', 'FINISHING']):
            continue

        try:
            l = float(row_l) if row_l is not None else 0
            w = float(row_w) if row_w is not None else 0
            t = float(row_t) if row_t is not None else 0
            q = float(row_q) if row_q is not None else 1
        except:
            l, w, t, q = 0, 0, 0, 1

        # Parse sawmill
        vol_m3 = (l * w * t * q) / 1e9 if (l and w and t and q) else 0
        if t <= 25 and t > 0:
            belah_m3['belah_25'] += vol_m3
        elif t <= 40 and t > 25:
            belah_m3['belah_40'] += vol_m3
        elif t <= 45 and t > 40:
            belah_m3['belah_45'] += vol_m3
        elif t > 45:
            belah_m3['belah_50'] += vol_m3

        # Classification
        if 'PLYWOOD' in c8_str or 'PLYWOOD' in c7_str or 'TRIPLEK' in c8_str:
            t_panel = 12
            if '18' in c8_str: t_panel = 18
            elif '15' in c8_str: t_panel = 15
            elif '9' in c8_str: t_panel = 9
            elif '6' in c8_str: t_panel = 6
            elif '3' in c8_str: t_panel = 3
            elif t in [3, 6, 9, 12, 15, 18, 24]: t_panel = int(t)

            p_line = {
                'line_no': len(panels) + 1,
                'component': str(row_c8),
                'panel_type': f'PLY-{t_panel}-RAW',
                'l': l if l > 0 else 1220,
                'w': w if w > 0 else 610,
                't': t_panel,
                'qty': q,
                'exposed_faces': 1
            }
            panels.append(p_line)

        elif any(k in c7_str for k in ['KAYU', 'JATI', 'MINDI', 'ASH']) or (l > 0 and w > 0 and t > 0 and q > 0 and ('PACK' not in c8_str and 'BOX' not in c8_str)):
            species = 'MINDI' if 'MINDI' in c7_str else 'TEAK'
            s_line = {
                'line_no': len(solids) + 1,
                'component': str(row_c8) or 'Part Kayu',
                'material': species,
                'l': l,
                'w': w,
                't': t,
                'qty': q,
                'exposed': 'Y',
                'curved': 'Y' if 'CURVED' in c8_str or 'LINGKARAN' in str(name).upper() else 'N'
            }
            solids.append(s_line)

        elif any(k in c8_str or k in c7_str for k in ['BUBUT', 'LASER', 'POWDER', 'BENDING', 'CNC']):
            custom.append({
                'category': 'SUBCONTRACT',
                'name': str(row_c8 or row_c7),
                'qty': q,
                'cost': float(row_tot or row_rate or 0)
            })

        elif any(k in c8_str for k in ['PACKING', 'BOX', 'CRATE']):
            is_crate = 'CRATE' in c8_str
            boxes.append({
                'box_no': len(boxes) + 1,
                'contents': str(row_c8),
                'type': 'CRATE' if is_crate else 'CARTON',
                'l': l if l > 0 else (ol or 500),
                'w': w if w > 0 else (ow or 500),
                'h': t if t > 0 else (oh or 500),
                'qty': q
            })

        elif any(k in c8_str for k in ['KAIN', 'CUSHION', 'BUSA', 'FOAM']):
            custom.append({
                'category': 'UPHOLSTERY',
                'name': str(row_c8),
                'qty': q,
                'cost': float(row_tot or row_rate or 0)
            })

        elif str(row_c8).strip():
            price = float(row_rate) if row_rate else (float(row_tot)/q if (row_tot and q > 0) else 0.0)
            hardware.append({
                'item_code': f'HW-{len(hardware)+1}',
                'description': str(row_c8),
                'qty': q,
                'uom': 'pcs',
                'unit_price': price
            })

    # Assemble item object
    item_obj = {
        'item_code': code,
        'item_name': name,
        'project_qty': qty,
        'overall_l': ol,
        'overall_w': ow,
        'overall_h': oh,
        'finish_recipe': 'NC NATURAL',
        'status': 'DRAFT',
        'version': 1,
        'target_margin': 30,
        'solid_components': solids,
        'panel_components': panels,
        'hardware_components': hardware,
        'custom_components': custom,
        'box_components': boxes,
        'custom_columns': {
            'photo_url': photo_url,
            'dwg_link': dwg_link,
            'spec_link': spec_link,
            'notes': notes,
            'room_distribution': {
                'ov': ov,
                'bv': bv,
                'total': qty
            },
            'sawmill_schedule': belah_m3
        }
    }
    extracted_items.append(item_obj)

print(f'Extraction complete! Total items prepared: {len(extracted_items)}')

# Save extracted items to temporary JSON file
with open('extracted_items.json', 'w', encoding='utf-8') as f:
    json.dump(extracted_items, f, indent=2)

print('Saved extracted_items.json for calculation & upsert.')
