const fs = require('fs');
const path = require('path');

function syncAndCleanPdfs() {
  const latexBaseDir = path.join(__dirname, '..', 'docs', 'cases', 'case_000', 'documents', 'latex');
  const publicPdfBaseDir = path.join(__dirname, '..', 'public', 'pdf', 'case_000');

  const phases = ['phase_0_initial', 'phase_1_inheritance', 'phase_2_altercation', 'phase_3_conclusion'];

  let count = 0;

  for (const phase of phases) {
    const phaseLatexDir = path.join(latexBaseDir, phase);
    const phasePdfDir = path.join(publicPdfBaseDir, phase);

    if (!fs.existsSync(phaseLatexDir)) continue;

    // Move generated PDF files to public folder
    const pdfFiles = fs.readdirSync(phaseLatexDir).filter(f => f.endsWith('.pdf'));

    for (const file of pdfFiles) {
      const srcPdfPath = path.join(phaseLatexDir, file);
      const destPdfPath = path.join(phasePdfDir, file);

      if (!fs.existsSync(phasePdfDir)) {
        fs.mkdirSync(phasePdfDir, { recursive: true });
      }

      fs.copyFileSync(srcPdfPath, destPdfPath);
      fs.unlinkSync(srcPdfPath); // Delete PDF from latex source directory to keep it clean
      console.log(`✓ Moved & Cleaned: ${file} -> public/pdf/case_000/${phase}/`);
      count++;
    }

    // Clean up temporary LaTeX build files (.log, .aux, .out, etc.)
    const tempFiles = fs.readdirSync(phaseLatexDir).filter(f => 
      f.endsWith('.log') || f.endsWith('.aux') || f.endsWith('.out') || f.endsWith('.fls') || f.endsWith('.fdb_latexmk')
    );

    for (const tempFile of tempFiles) {
      const tempPath = path.join(phaseLatexDir, tempFile);
      fs.unlinkSync(tempPath);
      console.log(`🧹 Cleaned build temp file: ${tempFile}`);
    }
  }

  console.log(`🎉 Complete! ${count} PDF(s) synced to public folder and latex directory is 100% clean.`);
}

syncAndCleanPdfs();
