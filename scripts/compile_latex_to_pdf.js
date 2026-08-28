const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Paths to standard Windows fonts supporting full Vietnamese UTF-8
const FONT_REGULAR = 'C:\\Windows\\Fonts\\times.ttf';
const FONT_BOLD = 'C:\\Windows\\Fonts\\timesbd.ttf';
const FONT_ITALIC = 'C:\\Windows\\Fonts\\timesi.ttf';

function parseLatexToStructuredLines(latexText) {
  const rawLines = latexText.split('\n');
  const items = [];

  for (let raw of rawLines) {
    let line = raw.trim();
    if (!line || line.startsWith('%')) continue;

    // Detect section / headers
    if (line.includes('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM') || line.includes('BỘ CÔNG AN') || line.includes('CÔNG AN THÀNH PHỐ HÀ NỘI')) {
      items.push({ text: cleanLine(line), align: 'center', isBold: true, size: 11 });
    } else if (line.includes('Độc lập - Tự do - Hạnh phúc')) {
      items.push({ text: cleanLine(line), align: 'center', isBold: true, size: 11, underline: true });
    } else if (line.includes('\\Large') || line.includes('\\large') || line.startsWith('\\section*')) {
      items.push({ text: cleanLine(line), align: 'center', isBold: true, size: 14, spacingBefore: 10 });
    } else if (line.startsWith('\\item')) {
      items.push({ text: '• ' + cleanLine(line), align: 'left', isBold: false, size: 11 });
    } else {
      const isBold = line.includes('\\textbf');
      const isItalic = line.includes('\\textit');
      items.push({
        text: cleanLine(line),
        align: 'left',
        isBold: isBold,
        isItalic: isItalic,
        size: 11
      });
    }
  }

  return items;
}

function cleanLine(str) {
  return str
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\underline\{([^}]+)\}/g, '$1')
    .replace(/\\large\{([^}]+)\}/g, '$1')
    .replace(/\\Large\{([^}]+)\}/g, '$1')
    .replace(/\\small\{([^}]+)\}/g, '$1')
    .replace(/\\section\*\{([^}]+)\}/g, '$1')
    .replace(/\\begin\{[^}]+\}/g, '')
    .replace(/\\end\{[^}]+\}/g, '')
    .replace(/\\item/g, '')
    .replace(/\\noindent/g, '')
    .replace(/\\vspace\{[^}]+\}/g, '')
    .replace(/\\hfill/g, '   ')
    .replace(/\\\[[^\]]+\\\]/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[\{\}]/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

function renderTexToPdf(texPath, pdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const texContent = fs.readFileSync(texPath, 'utf8');
      const items = parseLatexToStructuredLines(texContent);

      const pdfDir = path.dirname(pdfPath);
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Register fonts
      doc.registerFont('Times-Regular', FONT_REGULAR);
      doc.registerFont('Times-Bold', FONT_BOLD);
      doc.registerFont('Times-Italic', FONT_ITALIC);

      for (let item of items) {
        if (!item.text) continue;

        if (item.spacingBefore) {
          doc.moveDown(0.5);
        }

        let font = 'Times-Regular';
        if (item.isBold) font = 'Times-Bold';
        else if (item.isItalic) font = 'Times-Italic';

        doc.font(font)
           .fontSize(item.size || 11)
           .fillColor('#1a1a1a')
           .text(item.text, {
             align: item.align || 'left',
             underline: item.underline || false,
             lineGap: 4
           });
      }

      doc.end();

      stream.on('finish', () => {
        console.log(`✓ PDF Generated: ${path.basename(pdfPath)}`);
        resolve();
      });

      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  const latexBaseDir = path.join(__dirname, '..', 'docs', 'cases', 'case_000', 'documents', 'latex');
  const publicPdfBaseDir = path.join(__dirname, '..', 'public', 'pdf', 'case_000');

  const phases = ['phase_0_initial', 'phase_1_inheritance', 'phase_2_altercation', 'phase_3_conclusion'];

  for (const phase of phases) {
    const phaseLatexDir = path.join(latexBaseDir, phase);
    const phasePdfDir = path.join(publicPdfBaseDir, phase);

    if (!fs.existsSync(phaseLatexDir)) continue;

    const files = fs.readdirSync(phaseLatexDir).filter(f => f.endsWith('.tex'));

    for (const file of files) {
      const texPath = path.join(phaseLatexDir, file);
      const pdfFileName = file.replace(/\.tex$/, '.pdf');
      const pdfPath = path.join(phasePdfDir, pdfFileName);

      await renderTexToPdf(texPath, pdfPath);
    }
  }

  console.log('🎉 TOÀN BỘ CÁC FILE PDF ĐÃ ĐƯỢC BIÊN DỊCH VÀ CẬP NHẬT THÀNH CÔNG VÀO PUBLIC/PDF/CASE_000!');
}

main().catch(err => {
  console.error('Lỗi biên dịch PDF:', err);
  process.exit(1);
});
