const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function safeCopyAndUnlink(src, dest, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      execSync('powershell -Command "Start-Sleep -Milliseconds 200"');
    }
  }
}

function compileAndCleanLatex() {
  const targetFilter = process.argv[2] ? process.argv[2].toLowerCase() : null;
  const rootDir = path.join(__dirname, '..');
  const latexBaseDir = path.join(rootDir, 'docs', 'cases', 'case_000', '03_documents', 'latex');
  const publicPdfBaseDir = path.join(rootDir, 'public', 'documents', 'case_000');
  const logDir = path.join(rootDir, '.vscode', 'latex_logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const pdflatexPath = 'C:\\Users\\dell\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe';
  const phases = ['phase_0_initial', 'phase_1_inheritance', 'phase_2_altercation', 'phase_3_conclusion'];

  let successCount = 0;

  for (const phase of phases) {
    const phaseLatexDir = path.join(latexBaseDir, phase);
    const phasePdfDir = path.join(publicPdfBaseDir, phase);

    if (!fs.existsSync(phaseLatexDir)) continue;

    const texFiles = fs.readdirSync(phaseLatexDir).filter(f => {
      if (!f.endsWith('.tex')) return false;
      if (targetFilter) {
        return f.toLowerCase().includes(targetFilter) || path.basename(f, '.tex').toLowerCase().includes(targetFilter);
      }
      return true;
    });

    for (const texFile of texFiles) {
      const texPath = path.join(phaseLatexDir, texFile);
      const baseName = path.basename(texFile, '.tex');
      
      console.log(`⏳ Compiling ${phase}/${texFile}...`);

      try {
        // Run pdflatex directly in the phase folder
        execSync(`"${pdflatexPath}" -interaction=nonstopmode "${texFile}"`, {
          cwd: phaseLatexDir,
          stdio: 'pipe'
        });
      } catch (err) {
        console.warn(`⚠️ Warning: pdflatex returned non-zero for ${texFile}, checking if output PDF exists...`);
      }

      const generatedPdf = path.join(phaseLatexDir, `${baseName}.pdf`);
      const destPdfPublic = path.join(publicPdfBaseDir, phase, `${baseName}.pdf`);
      const destPdfDocs = path.join(rootDir, 'docs', 'cases', 'case_000', '03_documents', 'pdf', phase, `${baseName}.pdf`);

      if (fs.existsSync(generatedPdf)) {
        const publicDir = path.dirname(destPdfPublic);
        const docsDir = path.dirname(destPdfDocs);

        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

        // Copy to both public and docs directory, then clean up temp pdf
        fs.copyFileSync(generatedPdf, destPdfPublic);
        fs.copyFileSync(generatedPdf, destPdfDocs);
        fs.unlinkSync(generatedPdf);
        console.log(`✓ Updated PDF: public & docs for ${phase}/${baseName}.pdf`);
        successCount++;
      } else {
        console.error(`❌ Failed to produce PDF for ${texFile}`);
      }

      // Move log file to .vscode/latex_logs/
      const generatedLog = path.join(phaseLatexDir, `${baseName}.log`);
      if (fs.existsSync(generatedLog)) {
        const destLog = path.join(logDir, `${baseName}.log`);
        safeCopyAndUnlink(generatedLog, destLog);
        console.log(`📋 Log saved: .vscode/latex_logs/${baseName}.log`);
      }

      // Clean up auxiliary temporary files
      const auxExtensions = ['.aux', '.out', '.fls', '.fdb_latexmk', '.synctex.gz'];
      for (const ext of auxExtensions) {
        const tempFile = path.join(phaseLatexDir, `${baseName}${ext}`);
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }
  }

  console.log(`\n🎉 Successfully processed ${successCount} PDF(s). LaTeX directory is clean!`);
}

compileAndCleanLatex();
