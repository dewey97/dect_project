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

function resolveEngine() {
  const localTectonic = path.join(__dirname, 'bin', 'tectonic.exe');
  if (fs.existsSync(localTectonic)) {
    return { type: 'tectonic', bin: localTectonic };
  }
  try {
    execSync('tectonic --version', { stdio: 'ignore' });
    return { type: 'tectonic', bin: 'tectonic' };
  } catch (e) {}

  if (process.env.PDFLATEX_PATH && fs.existsSync(process.env.PDFLATEX_PATH)) {
    return { type: 'pdflatex', bin: process.env.PDFLATEX_PATH };
  }
  try {
    execSync('pdflatex --version', { stdio: 'ignore' });
    return { type: 'pdflatex', bin: 'pdflatex' };
  } catch (e) {}

  const candidatePaths = [
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64', 'pdflatex.exe') : null,
    'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe',
    'C:\\Program Files (x86)\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe',
    'C:\\Users\\dell\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe',
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return { type: 'pdflatex', bin: p };
  }
  return { type: 'tectonic', bin: localTectonic };
}

function getAllFiles(dir, ext) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function compileAndCleanLatex() {
  const targetFilter = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].toLowerCase() : null;
  const rootDir = path.join(__dirname, '..');
  const latexBaseDir = path.join(rootDir, 'latex', 'case_000');
  const publicPdfBaseDir = path.join(rootDir, 'public', 'documents', 'case_000');
  const logDir = path.join(rootDir, '.vscode', 'latex_logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const engine = resolveEngine();
  console.log(`Using LaTeX engine: [${engine.type}] at ${engine.bin}`);

  const texFiles = getAllFiles(latexBaseDir, '.tex').filter(filePath => {
    if (!targetFilter) return true;
    const base = path.basename(filePath, '.tex').toLowerCase();
    const rel = path.relative(latexBaseDir, filePath).toLowerCase();
    return base.includes(targetFilter) || rel.includes(targetFilter);
  });

  let successCount = 0;

  for (const texPath of texFiles) {
    const relPath = path.relative(latexBaseDir, texPath);
    const relDir = path.dirname(relPath);
    const baseName = path.basename(texPath, '.tex');
    const outPdfDir = path.join(publicPdfBaseDir, relDir);
    const destPdf = path.join(outPdfDir, `${baseName}.pdf`);

    if (!fs.existsSync(outPdfDir)) {
      fs.mkdirSync(outPdfDir, { recursive: true });
    }

    console.log(`⏳ Compiling ${relPath}...`);

    try {
      if (engine.type === 'tectonic') {
        execSync(`"${engine.bin}" "${texPath}" --outdir "${outPdfDir}"`, {
          cwd: path.dirname(texPath),
          stdio: 'pipe'
        });
      } else {
        execSync(`"${engine.bin}" -interaction=nonstopmode "${path.basename(texPath)}"`, {
          cwd: path.dirname(texPath),
          stdio: 'pipe'
        });
        const generatedPdf = path.join(path.dirname(texPath), `${baseName}.pdf`);
        if (fs.existsSync(generatedPdf)) {
          fs.copyFileSync(generatedPdf, destPdf);
          fs.unlinkSync(generatedPdf);
        }
      }

      if (fs.existsSync(destPdf)) {
        console.log(`✓ Updated PDF: ${path.relative(rootDir, destPdf)}`);
        successCount++;
      } else {
        console.error(`❌ Failed to produce PDF for ${relPath}`);
      }
    } catch (err) {
      console.warn(`⚠️ Error compiling ${relPath}: ${err.message}`);
    }

    // Move log file if generated
    const localLog = path.join(path.dirname(texPath), `${baseName}.log`);
    if (fs.existsSync(localLog)) {
      const destLog = path.join(logDir, `${baseName}.log`);
      safeCopyAndUnlink(localLog, destLog);
    }

    // Clean up aux
    const auxExtensions = ['.aux', '.out', '.fls', '.fdb_latexmk', '.synctex.gz'];
    for (const ext of auxExtensions) {
      const tempFile = path.join(path.dirname(texPath), `${baseName}${ext}`);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  console.log(`\n🎉 Successfully processed ${successCount} PDF(s). LaTeX directory is clean!`);
}

compileAndCleanLatex();

