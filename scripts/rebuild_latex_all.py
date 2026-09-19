import os, sys, re, glob, subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(ROOT_DIR, 'docs', 'cases', 'case_000', '03_documents')
LATEX_DIR = os.path.join(ROOT_DIR, 'latex', 'case_000')

PREAMBLE = r"""\documentclass[12pt,a4paper]{article}
\usepackage{fontspec}
\setmainfont{Times New Roman}
\usepackage[top=2cm,bottom=2cm,left=2.5cm,right=2cm]{geometry}
\usepackage{enumitem}
\usepackage{tabularx}
\usepackage{booktabs}
\usepackage{array}
\newcolumntype{Y}{>{\centering\arraybackslash}X}
\pagestyle{plain}
\linespread{1.15}

\begin{document}
"""

POSTAMBLE = r"""
\end{document}
"""

def strip_emojis(text):
    # Remove emoji and symbol glyphs that don't exist in standard Times New Roman
    text = re.sub(r'[\U00010000-\U0010ffff]', '', text)
    text = re.sub(r'[📓📰🔍📌📱⚖🚨📁📜🏢✔✖▶◀⭐★☆►▼▲◆■□●○]', '', text)
    return text

def clean_box_drawing(text):
    box_map = {
        '┌': '+', '┐': '+', '└': '+', '┘': '+', '├': '+', '┤': '+',
        '┬': '+', '┴': '+', '┼': '+', '─': '-', '│': '|', '═': '=',
        '║': '|', '╒': '+', '╕': '+', '╘': '+', '╛': '+', '╞': '+',
        '╡': '+', '╤': '=', '╧': '=', '╪': '=', '•': '-', '–': '-', '—': '---'
    }
    for k, v in box_map.items():
        text = text.replace(k, v)
    return text

def escape_latex(text):
    if not text:
        return ""
    text = strip_emojis(text)
    
    text = text.replace(r'$\rightarrow$', '-->')
    text = text.replace(r'\$\rightarrow\$', '-->')
    
    text = text.replace(r'\&', '&')
    text = text.replace('&', r'\&')
    
    text = text.replace(r'\%', '%')
    text = text.replace('%', r'\%')
    
    text = text.replace(r'\#', '#')
    text = text.replace('#', r'\#')
    
    text = text.replace(r'\$', '$')
    text = text.replace('$', r'\$')
    
    text = text.replace(r'\_', '_')
    text = text.replace('_', r'\_')
    
    return text

def convert_md_inline(text):
    if not text:
        return ""
    
    text = strip_emojis(text)
    
    bold_tokens = []
    def bold_repl(m):
        bold_tokens.append(m.group(1))
        return f"XYZBOLDTOKENXYZ{len(bold_tokens)-1}XYZ"
    
    text = re.sub(r'\*\*([^*]+)\*\*', bold_repl, text)
    text = re.sub(r'__([^_]+)__', bold_repl, text)
    
    italic_tokens = []
    def italic_repl(m):
        italic_tokens.append(m.group(1))
        return f"XYZITALICTOKENXYZ{len(italic_tokens)-1}XYZ"
    
    text = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', italic_repl, text)
    text = re.sub(r'(?<!_)_([^_]+)_(?!_)', italic_repl, text)
    
    code_tokens = []
    def code_repl(m):
        code_tokens.append(m.group(1))
        return f"XYZCODETOKENXYZ{len(code_tokens)-1}XYZ"
    
    text = re.sub(r'`([^`]+)`', code_repl, text)
    
    text = escape_latex(text)
    
    for idx, c in enumerate(code_tokens):
        c_esc = escape_latex(c)
        text = text.replace(f"XYZCODETOKENXYZ{idx}XYZ", f"\\texttt{{{c_esc}}}")
        
    for idx, it in enumerate(italic_tokens):
        it_conv = convert_md_inline(it)
        text = text.replace(f"XYZITALICTOKENXYZ{idx}XYZ", f"\\textit{{{it_conv}}}")
        
    for idx, b in enumerate(bold_tokens):
        b_conv = convert_md_inline(b)
        text = text.replace(f"XYZBOLDTOKENXYZ{idx}XYZ", f"\\textbf{{{b_conv}}}")
        
    text = text.replace('-->', r'$\rightarrow$')
    text = text.replace('->', r'$\rightarrow$')
    text = text.replace('→', r'$\rightarrow$')
    
    return text

def format_table(rows):
    if not rows:
        return ""
    num_cols = max(len(r) for r in rows)
    if num_cols == 0:
        return ""
        
    flat_text = " ".join(" ".join(r) for r in rows)
    
    if ('Ký' in flat_text or 'Đã ký' in flat_text or 'CÁN BỘ' in flat_text or 'ĐIỀU TRA VIÊN' in flat_text) and len(rows) <= 4:
        col_spec = "Y" * num_cols
        out = [f"\n\\vspace{{0.8cm}}\n\\noindent\n\\begin{{tabularx}}{{\\textwidth}}{{{col_spec}}}\n\\toprule"]
        
        titles = [convert_md_inline(c) for c in rows[0]]
        out.append(" & ".join(titles) + r" \\")
        out.append(r"\midrule")
        
        if len(rows) > 1:
            notes = [convert_md_inline(c) for c in rows[1]]
            out.append(" & ".join(notes) + r" \\[1.5cm]")
            
        if len(rows) > 2:
            names = [convert_md_inline(c.replace('<br><br>', '').replace('(Đã ký)', '').strip()) for c in rows[-1]]
            out.append(" & ".join(names) + r" \\")
            
        out.append(r"\bottomrule")
        out.append(r"\end{tabularx}")
        return "\n".join(out)
        
    if num_cols == 2:
        col_spec = "p{4cm} X"
    elif num_cols == 3:
        col_spec = "p{2.5cm} p{4cm} X"
    elif num_cols == 4:
        col_spec = "p{1.5cm} p{3.5cm} p{4cm} X"
    else:
        col_spec = "l " * (num_cols - 1) + "X"
        
    out = [f"\n\\begin{{tabularx}}{{\\textwidth}}{{{col_spec}}}\n\\toprule"]
    for idx, row in enumerate(rows):
        r_padded = row + [''] * (num_cols - len(row))
        cells = [convert_md_inline(c) for c in r_padded]
        out.append(" & ".join(cells) + r" \\")
        if idx == 0:
            out.append(r"\midrule")
    out.append(r"\bottomrule")
    out.append(r"\end{tabularx}")
    return "\n".join(out)

def parse_markdown_doc(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = [line.rstrip() for line in f]
        
    rel_md = os.path.relpath(md_path, DOCS_DIR)
    
    agency_top = "CÔNG AN THÀNH PHỐ HÀ NỘI"
    agency_bot = "PHÒNG CẢNH SÁT HÌNH SỰ (PC02)"
    doc_num = "00/HS"
    date_str = "Hà Nội, ngày 25 tháng 07 năm 2016"
    title = "TÀI LIỆU VỤ ÁN"
    subtitle = ""
    
    body_lines = []
    header_parsed = False
    in_table = False
    table_rows = []
    in_list = False
    list_type = None
    in_code_block = False
    code_block_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()
        
        if trimmed.startswith('```'):
            if in_code_block:
                in_code_block = False
                code_lines_out = []
                for cl in code_block_lines:
                    cl_clean = escape_latex(clean_box_drawing(cl))
                    if not cl_clean.strip():
                        code_lines_out.append(r"\vspace{0.2cm}")
                    else:
                        code_lines_out.append(cl_clean + r"\\")
                joined_body = "\n".join(code_lines_out)
                body_lines.append(f"\n\\begin{{quote}}\n\\fontsize{{9pt}}{{11pt}}\\selectfont\\ttfamily\n{joined_body}\n\\end{{quote}}\n")
                code_block_lines = []
            else:
                in_code_block = True
                code_block_lines = []
            i += 1
            continue
            
        if in_code_block:
            code_block_lines.append(line)
            i += 1
            continue
            
        if not header_parsed and i < 25:
            if trimmed.startswith('CÔNG AN ') or trimmed.startswith('NGÂN HÀNG ') or trimmed.startswith('BỘ CÔNG AN') or trimmed.startswith('UBND ') or trimmed.startswith('TÒA ÁN '):
                agency_top = trimmed.replace('**', '').strip()
                i += 1
                if i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('Số:') and not lines[i].strip().startswith('#') and not lines[i].strip().startswith('---'):
                    agency_bot = lines[i].strip().replace('**', '').strip()
                    i += 1
                continue
            if trimmed.startswith('CƠ QUAN ') or trimmed.startswith('PHÒNG ') or trimmed.startswith('CÔNG AN PHƯỜNG') or trimmed.startswith('VIỆN KIỂM SÁT '):
                agency_bot = trimmed.replace('**', '').strip()
                i += 1
                continue
            if trimmed.startswith('Số:') or trimmed.startswith('**Số:'):
                doc_num = trimmed.replace('**', '').replace('Số:', '').replace('`', '').strip()
                i += 1
                continue
            if trimmed.startswith('*Hà Nội') or trimmed.startswith('* hồi') or 'ngày 25 tháng 07' in trimmed or 'ngày 20 tháng 07' in trimmed or 'ngày 26 tháng 07' in trimmed or 'ngày 18 tháng 07' in trimmed or 'ngày 28 tháng 07' in trimmed or 'ngày 24 tháng 07' in trimmed:
                date_str = trimmed.replace('*', '').strip()
                i += 1
                continue
            if 'CỘNG HÒA' in trimmed or 'Độc lập' in trimmed or trimmed == '---':
                i += 1
                continue
            if trimmed.startswith('# '):
                title = trimmed.replace('# ', '').strip()
                header_parsed = True
                i += 1
                if i < len(lines):
                    next_trim = lines[i].strip()
                    if (next_trim.startswith('*(') or next_trim.startswith('(')) and next_trim.endswith(')'):
                        subtitle = next_trim.replace('*', '').strip()
                        i += 1
                continue
            i += 1
            continue
            
        header_parsed = True
        
        if 'CỘNG HÒA' in trimmed or 'Độc lập' in trimmed or trimmed == '---':
            i += 1
            continue
            
        if trimmed.startswith('### '):
            if in_list:
                body_lines.append(f"\\end{{{list_type}}}")
                in_list = False
            heading_text = convert_md_inline(trimmed[4:].strip())
            body_lines.append(f"\n\\subsection*{{{heading_text}}}\n")
            i += 1
            continue
            
        if trimmed.startswith('#### '):
            if in_list:
                body_lines.append(f"\\end{{{list_type}}}")
                in_list = False
            heading_text = convert_md_inline(trimmed[5:].strip())
            body_lines.append(f"\n\\subsubsection*{{{heading_text}}}\n")
            i += 1
            continue
            
        if trimmed.startswith('## '):
            if in_list:
                body_lines.append(f"\\end{{{list_type}}}")
                in_list = False
            heading_text = convert_md_inline(trimmed[3:].strip())
            if '═══' in heading_text or '---' in heading_text:
                i += 1
                continue
            body_lines.append(f"\n\\subsection*{{{heading_text}}}\n")
            i += 1
            continue
        
        if trimmed.startswith('# '):
            if in_list:
                body_lines.append(f"\\end{{{list_type}}}")
                in_list = False
            heading_text = convert_md_inline(trimmed[2:].strip())
            body_lines.append(f"\n\\subsection*{{{heading_text}}}\n")
            i += 1
            continue
            
        m_hoi = re.match(r'^\*\s*\*\*(Hỏi[^*]*):\*\*\s*(.*)$', trimmed)
        if m_hoi:
            if in_list:
                body_lines.append(f"\\end{{{list_type}}}")
                in_list = False
            q_name = convert_md_inline(m_hoi.group(1).strip())
            q_text = convert_md_inline(m_hoi.group(2).strip())
            body_lines.append(f"\\noindent\\textbf{{{q_name}:}} \\textit{{{q_text}}}\\\\[0.15cm]")
            i += 1
            continue
            
        m_dap = re.match(r'^\*\s*\*\*(Đáp[^*]*):\*\*\s*(.*)$', trimmed)
        if m_dap:
            if in_list:
                body_lines.append(f"\\end{{{list_type}}}")
                in_list = False
            a_name = convert_md_inline(m_dap.group(1).strip())
            a_text = convert_md_inline(m_dap.group(2).strip())
            body_lines.append(f"\\noindent\\textbf{{{a_name}:}} {a_text}\\\\[0.35cm]")
            i += 1
            continue
            
        if trimmed.startswith('* ') or trimmed.startswith('- ') or trimmed.startswith('• '):
            item_content = convert_md_inline(trimmed[2:].strip())
            if not in_list or list_type != 'itemize':
                if in_list:
                    body_lines.append(f"\\end{{{list_type}}}")
                body_lines.append(r"\begin{itemize}[leftmargin=1.2cm, itemsep=2pt]")
                in_list = True
                list_type = 'itemize'
            body_lines.append(f"  \\item {item_content}")
            i += 1
            continue
            
        m_num_list = re.match(r'^(\d+)\.\s+(.*)$', trimmed)
        if m_num_list:
            item_content = convert_md_inline(m_num_list.group(2).strip())
            if not in_list or list_type != 'enumerate':
                if in_list:
                    body_lines.append(f"\\end{{{list_type}}}")
                body_lines.append(r"\begin{enumerate}[label=\arabic*., leftmargin=1.2cm, itemsep=2pt]")
                in_list = True
                list_type = 'enumerate'
            body_lines.append(f"  \\item {item_content}")
            i += 1
            continue
            
        if in_list and trimmed != '':
            body_lines.append(f"\\end{{{list_type}}}")
            in_list = False
            
        if trimmed.startswith('|') and trimmed.endswith('|'):
            cols = [c.strip() for c in trimmed.split('|')[1:-1]]
            if all(set(c).issubset({'-', ':', ' '}) for c in cols):
                i += 1
                continue
            table_rows.append(cols)
            if i + 1 >= len(lines) or not lines[i+1].strip().startswith('|'):
                table_latex = format_table(table_rows)
                body_lines.append(table_latex)
                table_rows = []
            i += 1
            continue

        if trimmed:
            body_lines.append(convert_md_inline(trimmed) + "\n")
        else:
            body_lines.append("")
        i += 1
        
    if in_list:
        body_lines.append(f"\\end{{{list_type}}}")
        
    body_str = '\n'.join(body_lines)
    
    return build_final_tex(rel_md, agency_top, agency_bot, doc_num, date_str, title, subtitle, body_str)

def build_final_tex(rel_md, agency_top, agency_bot, doc_num, date_str, title, subtitle, body_str):
    agency_top_esc = convert_md_inline(agency_top)
    agency_bot_esc = convert_md_inline(agency_bot)
    doc_num_esc = convert_md_inline(doc_num.replace('Số:', '').replace('`', '').strip())
    if not doc_num_esc: doc_num_esc = "00/HS"
    date_str_esc = convert_md_inline(date_str)
    title_esc = convert_md_inline(title)
    subtitle_esc = convert_md_inline(subtitle)
    
    if '00_huong_dan_ban_dau' in rel_md:
        header = f"""% --- HƯỚNG DẪN ĐIỀU TRA ---
\\begin{{center}}
    \\fontsize{{12pt}}{{14pt}}\\selectfont
    \\textbf{{TỔNG CỤC CẢNH SÁT — BAN ĐIỀU PHỐI HỒ SƠ VỤ ÁN}}\\\\[-0.2em]
    \\rule{{6cm}}{{0.6pt}}\\\\[0.6cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.4cm}}
"""
        return PREAMBLE + header + body_str + POSTAMBLE
        
    if '13_don_khoi_kien' in rel_md:
        header = f"""% --- ĐƠN KHỞI KIỆN ---
\\begin{{center}}
    \\fontsize{{12pt}}{{14pt}}\\selectfont
    \\textbf{{CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM}}\\\\
    \\textbf{{Độc lập - Tự do - Hạnh phúc}}\\\\[-0.2em]
    \\rule{{4cm}}{{0.6pt}}\\\\[0.6cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.4cm}}
"""
        footer = """\\vspace{0.8cm}
\\noindent
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
    \\begin{center}
        \\textit{Hà Nội, ngày 20 tháng 07 năm 2016}\\\\[0.1cm]
        \\textbf{NGƯỜI KHỞI KIỆN}\\\\[0.1cm]
        \\textit{(Ký và ghi rõ họ tên)}\\\\[1.6cm]
        \\textbf{Nguyễn Ngọc Mai}
    \\end{center}
\\end{minipage}
"""
        return PREAMBLE + header + body_str + footer + POSTAMBLE
        
    if '01_tu_thu_xo_xat_tung' in rel_md:
        header = f"""% --- BẢN TỰ KHAI ---
\\begin{{center}}
    \\fontsize{{12pt}}{{14pt}}\\selectfont
    \\textbf{{CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM}}\\\\
    \\textbf{{Độc lập - Tự do - Hạnh phúc}}\\\\[-0.2em]
    \\rule{{4cm}}{{0.6pt}}\\\\[0.6cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.4cm}}
"""
        footer = """\\vspace{0.8cm}
\\noindent
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
    \\begin{center}
        \\textit{Hà Nội, ngày 26 tháng 07 năm 2016}\\\\[0.1cm]
        \\textbf{NGƯỜI TỰ KHAI}\\\\[0.1cm]
        \\textit{(Ký và ghi rõ họ tên)}\\\\[1.6cm]
        \\textbf{Nguyễn Thanh Tùng}
    \\end{center}
\\end{minipage}
"""
        return PREAMBLE + header + body_str + footer + POSTAMBLE

    if '15_trich_doan_bai_bao' in rel_md or '10_so_ghi_no' in rel_md or '11_bang_tin_rao_vat' in rel_md or 'dev00' in rel_md or '01_so_thu_chi_quan_bia' in rel_md:
        header = f"""% --- TÀI LIỆU VẬT CHỨNG HIỆN TRƯỜNG ---
\\begin{{center}}
    \\fontsize{{11pt}}{{13pt}}\\selectfont
    \\textbf{{HỒ SƠ VẬT CHỨNG — CHUYÊN ÁN MẠNG SỐ 14 ĐƯỜNG BỜ SÔNG}}\\\\[-0.2em]
    \\rule{{6cm}}{{0.6pt}}\\\\[0.5cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.4cm}}
"""
        return PREAMBLE + header + body_str + POSTAMBLE

    header = f"""% --- HEADER 2 CỘT CHUẨN NGHỊ ĐỊNH 30/2020/NĐ-CP ---
\\noindent
\\begin{{minipage}}[t]{{0.45\\textwidth}}
    \\begin{{center}}
        \\fontsize{{11pt}}{{13pt}}\\selectfont
        {agency_top_esc}\\\\
        \\textbf{{{agency_bot_esc}}}\\\\[-0.2em]
        \\rule{{3.2cm}}{{0.6pt}}\\\\[0.25cm]
        \\fontsize{{11pt}}{{13pt}}\\selectfont Số: \\textbf{{{doc_num_esc}}}
    \\end{{center}}
\\end{{minipage}}
\\hfill
\\begin{{minipage}}[t]{{0.52\\textwidth}}
    \\begin{{center}}
        \\fontsize{{11pt}}{{13pt}}\\selectfont
        \\textbf{{CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM}}\\\\
        \\textbf{{Độc lập - Tự do - Hạnh phúc}}\\\\[-0.2em]
        \\rule{{3.6cm}}{{0.6pt}}\\\\[0.25cm]
        \\textit{{{date_str_esc}}}
    \\end{{center}}
\\end{{minipage}}

\\vspace{{0.6cm}}

\\begin{{center}}
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}

\\vspace{{0.4cm}}
"""
    return PREAMBLE + header + body_str + POSTAMBLE

def build_all():
    md_files = glob.glob(os.path.join(DOCS_DIR, '**', '*.md'), recursive=True)
    print(f"Converting {len(md_files)} markdown files into LaTeX...")
    
    for md_path in sorted(md_files):
        rel = os.path.relpath(md_path, DOCS_DIR)
        tex_rel = rel.replace('.md', '.tex')
        if rel == '05_ky_su_hau_an.md':
            tex_rel = os.path.join('04_ket_luan', '05_ky_su_hau_an.tex')
        elif rel == 'de_nghi_truy_to.md':
            tex_rel = os.path.join('04_ket_luan', 'de_nghi_truy_to.tex')
            
        if '01_tiep_nhan_tin_bao' in tex_rel or '02_quyet_dinh_khoi_to' in tex_rel:
            print(f"  -> Skipping manually polished {tex_rel}")
            continue
            
        tex_path = os.path.join(LATEX_DIR, tex_rel)
        os.makedirs(os.path.dirname(tex_path), exist_ok=True)
        
        print(f"Converting: {rel} -> {tex_rel}")
        tex_content = parse_markdown_doc(md_path)
        
        with open(tex_path, 'w', encoding='utf-8') as f:
            f.write(tex_content)
            
    print("\nAll LaTeX files successfully generated from Markdown!")

if __name__ == '__main__':
    build_all()

