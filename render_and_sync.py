
import base64
import os
import shutil

# 1. Read the newly rendered COA and Label images
with open('frontend/public/assets/reports/coa-drops-report.jpg', 'rb') as f:
    coa_b64 = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('utf-8')

with open('frontend/public/assets/reports/label-drops-report.jpg', 'rb') as f:
    label_b64 = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('utf-8')

# 2. Write to reportData.ts
report_content = f'''// Embedded HD Certificate Previews (Rendered directly from PDF pages)
export const COA_DROPS_PDF_URL = "/COA_Drops.pdf";
export const LABEL_DROPS_PDF_URL = "/Label_Drops.pdf";

export const LAB_TEST_REPORT_HD_IMAGE = "{coa_b64}";
export const NUTRITION_FACTS_HD_IMAGE = "{label_b64}";
'''

with open('frontend/src/assets/reports/reportData.ts', 'w', encoding='utf-8') as f:
    f.write(report_content)

print('Updated frontend/src/assets/reports/reportData.ts')

# 3. Copy to dist folders
for target_dir in ['frontend/dist/assets/reports', 'dist/assets/reports']:
    os.makedirs(target_dir, exist_ok=True)
    shutil.copy('frontend/public/assets/reports/coa-drops-report.jpg', os.path.join(target_dir, 'coa-drops-report.jpg'))
    shutil.copy('frontend/public/assets/reports/label-drops-report.jpg', os.path.join(target_dir, 'label-drops-report.jpg'))

# 4. Copy PDF to public and dist
src_pdf = r'd:\Caratone\COA_Drops copy.pdf'
if not os.path.exists(src_pdf):
    src_pdf = r'd:\Caratone\COA_Drops.pdf'

shutil.copy(src_pdf, 'frontend/public/COA_Drops.pdf')
if os.path.exists('frontend/dist'):
    shutil.copy(src_pdf, 'frontend/dist/COA_Drops.pdf')
if os.path.exists('dist'):
    shutil.copy(src_pdf, 'dist/COA_Drops.pdf')

print('All assets and dist files synced successfully!')
