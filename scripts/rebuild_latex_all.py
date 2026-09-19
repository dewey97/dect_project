import os, sys, re, glob, subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(ROOT_DIR, 'docs', 'cases', 'case_000', '03_documents')
LATEX_DIR = os.path.join(ROOT_DIR, 'latex', 'case_000')

PREAMBLE = r"""\documentclass[12pt,a4paper]{article}
\usepackage{fontspec}
\setmainfont{Times New Roman}
\usepackage[top=2.0cm,bottom=2.0cm,left=2.5cm,right=2.0cm]{geometry}
\usepackage{enumitem}
\usepackage{tabularx}
\usepackage{xltabular}
\usepackage{booktabs}
\usepackage{array}
\newcolumntype{Y}{>{\centering\arraybackslash}X}
\newcolumntype{C}[1]{>{\centering\arraybackslash}p{#1}}
\newcolumntype{L}[1]{>{\raggedright\arraybackslash}p{#1}}
\newcolumntype{R}[1]{>{\raggedleft\arraybackslash}p{#1}}
\pagestyle{plain}
\linespread{1.15}
\setlength{\parskip}{4pt plus 1pt minus 1pt}
\sloppy

\begin{document}
"""

POSTAMBLE = r"""
\end{document}
"""

def strip_emojis(text):
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
    
    # Replace <br>, <br/> with \newline
    text = re.sub(r'(?:<br\s*/?>\s*)+', r'\\newline ', text, flags=re.IGNORECASE)
    
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
        out = [f"\n\\vspace{{0.6cm}}\n\\noindent\n\\begin{{tabularx}}{{\\textwidth}}{{{col_spec}}}\n\\toprule"]
        
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
        
    font_wrap = ""
    if num_cols == 2:
        col_spec = ">{\\hsize=0.45\\hsize\\bfseries}X >{\\hsize=1.55\\hsize}X"
    elif num_cols == 3:
        col_spec = ">{\\hsize=0.3\\hsize}X >{\\hsize=0.5\\hsize}X >{\\hsize=1.2\\hsize}X"
    elif num_cols == 4:
        col_spec = ">{\\hsize=0.2\\hsize}X >{\\hsize=0.45\\hsize}X >{\\hsize=0.45\\hsize}X >{\\hsize=0.9\\hsize}X"
    elif num_cols == 6:
        # Col 1: STT, Col 2: Khung Giờ, Col 3: SĐT, Col 4: Danh bạ, Col 5: Loại cuộc gọi, Col 6: Nội dung
        col_spec = "C{0.7cm} C{1.2cm} C{2.2cm} L{2.2cm} C{2.0cm} >{\\raggedright\\arraybackslash}X"
        font_wrap = "\\small"
    elif num_cols >= 7:
        col_spec = "C{0.6cm} C{1.1cm} L{2.2cm} L{2.8cm} L{2.0cm} C{1.8cm} >{\\raggedright\\arraybackslash}X"
        font_wrap = "\\footnotesize"
    else:
        col_spec = " ".join([f">{{\\hsize=1.0\\hsize}}X"] * num_cols)
        font_wrap = "\\small" if num_cols >= 5 else ""
        
    out = []
    if font_wrap:
        out.append(f"\n\\vspace{{0.2cm}}\n\\begingroup\n{font_wrap}")
    else:
        out.append("\n\\vspace{0.2cm}\n\\begingroup")
        
    out.append(f"\\begin{{xltabular}}{{\\textwidth}}{{{col_spec}}}\n\\toprule")
    for idx, row in enumerate(rows):
        r_padded = row + [''] * (num_cols - len(row))
        cells = [convert_md_inline(c) for c in r_padded]
        if idx == 0:
            hdr_cells = []
            for c in cells:
                c_clean = c.replace(r'\&', r'\newline \&') if r'\newline' not in c else c
                hdr_cells.append(f"\\textbf{{{c_clean}}}" if not c_clean.startswith(r'\textbf{') else c_clean)
            out.append(" & ".join(hdr_cells) + r" \\")
            out.append(r"\midrule")
            out.append(r"\endfirsthead")
            out.append(r"\toprule")
            out.append(" & ".join(hdr_cells) + r" \\")
            out.append(r"\midrule")
            out.append(r"\endhead")
            out.append(r"\bottomrule")
            out.append(r"\endfoot")
        else:
            out.append(" & ".join(cells) + r" \\ \addlinespace[4pt]")
    out.append(r"\end{xltabular}")
    out.append(r"\endgroup")
    out.append("\n\\vspace{0.2cm}")
    return "\n".join(out)

def parse_signatures_and_footer(lines):
    i = len(lines) - 1
    sigs = []
    
    while i >= 0:
        line = lines[i].strip()
        if not line or line == '---':
            i -= 1
            continue
            
        if line.startswith('**') and line.endswith('**') and not line.startswith('**Nơi nhận:'):
            name = line.replace('**', '').strip()
            j = i - 1
            note = '(Ký, ghi rõ họ tên)'
            has_da_ky = False
            while j >= 0 and not lines[j].strip(): j -= 1
            
            if j >= 0 and ('(Đã ký' in lines[j] or 'Đã ký' in lines[j]):
                has_da_ky = True
                j -= 1
                while j >= 0 and not lines[j].strip(): j -= 1
                
            if j >= 0 and ('(Ký' in lines[j] or 'Ký' in lines[j]):
                note = lines[j].replace('*', '').strip()
                j -= 1
                while j >= 0 and not lines[j].strip(): j -= 1
                
            if j >= 0 and lines[j].strip().startswith('**') and lines[j].strip().endswith('**'):
                title = lines[j].strip().replace('**', '').strip()
                sigs.insert(0, (title, note, name, has_da_ky))
                i = j - 1
                continue
        break
        
    noi_nhan_lines = []
    j = i
    while j >= 0:
        line = lines[j].strip()
        if not line or line == '---':
            j -= 1
            continue
        if line.startswith('* ') or line.startswith('- ') or line.startswith('• '):
            noi_nhan_lines.insert(0, line[2:].strip())
            j -= 1
            continue
        if line.startswith('**Nơi nhận:**') or line.startswith('Nơi nhận:'):
            i = j - 1
            break
        else:
            noi_nhan_lines = []
            break
            
    remaining_lines = lines[:i+1]
    return sigs, noi_nhan_lines, remaining_lines

def format_footer_block(sigs, noi_nhan_lines):
    if not sigs and not noi_nhan_lines:
        return ""
        
    out = ["\\vspace{0.8cm}\n\\noindent"]
    
    if noi_nhan_lines and len(sigs) == 1:
        s_title, s_note, s_name, _ = sigs[0]
        s_title_esc = convert_md_inline(s_title)
        s_note_esc = convert_md_inline(s_note)
        s_name_esc = convert_md_inline(s_name)
        
        nn_items = "\\\\\n    ".join([f"- {convert_md_inline(it)}" for it in noi_nhan_lines])
        
        out.append(f"""\\begin{{minipage}}[t]{{0.45\\textwidth}}
    \\textbf{{\\textit{{Nơi nhận:}}}}\\\\[0.15cm]
    \\fontsize{{10pt}}{{12pt}}\\selectfont
    {nn_items}
\\end{{minipage}}
\\hfill
\\begin{{minipage}}[t]{{0.50\\textwidth}}
    \\begin{{center}}
        \\textbf{{{s_title_esc}}}\\\\[0.1cm]
        \\textit{{{s_note_esc}}}\\\\[1.6cm]
        \\textbf{{{s_name_esc}}}
    \\end{{center}}
\\end{{minipage}}""")
        return "\n".join(out)
        
    if len(sigs) == 2:
        s1_t, s1_note, s1_n, _ = sigs[0]
        s2_t, s2_note, s2_n, _ = sigs[1]
        
        out.append(f"""\\begin{{minipage}}[t]{{0.48\\textwidth}}
    \\begin{{center}}
        \\textbf{{{convert_md_inline(s1_t)}}}\\\\[0.1cm]
        \\textit{{{convert_md_inline(s1_note)}}}\\\\[1.6cm]
        \\textbf{{{convert_md_inline(s1_n)}}}
    \\end{{center}}
\\end{{minipage}}
\\hfill
\\begin{{minipage}}[t]{{0.48\\textwidth}}
    \\begin{{center}}
        \\textbf{{{convert_md_inline(s2_t)}}}\\\\[0.1cm]
        \\textit{{{convert_md_inline(s2_note)}}}\\\\[1.6cm]
        \\textbf{{{convert_md_inline(s2_n)}}}
    \\end{{center}}
\\end{{minipage}}""")
        return "\n".join(out)
        
    if len(sigs) == 1:
        s_t, s_note, s_n, _ = sigs[0]
        out.append(f"""\\hfill
\\begin{{minipage}}[t]{{0.50\\textwidth}}
    \\begin{{center}}
        \\textbf{{{convert_md_inline(s_t)}}}\\\\[0.1cm]
        \\textit{{{convert_md_inline(s_note)}}}\\\\[1.6cm]
        \\textbf{{{convert_md_inline(s_n)}}}
    \\end{{center}}
\\end{{minipage}}""")
        return "\n".join(out)
        
    if len(sigs) > 2:
        for idx in range(0, len(sigs), 2):
            if idx > 0:
                out.append("\\vspace{0.6cm}\n\\noindent")
            if idx + 1 < len(sigs):
                s1_t, s1_note, s1_n, _ = sigs[idx]
                s2_t, s2_note, s2_n, _ = sigs[idx+1]
                out.append(f"""\\begin{{minipage}}[t]{{0.48\\textwidth}}
    \\begin{{center}}
        \\textbf{{{convert_md_inline(s1_t)}}}\\\\[0.1cm]
        \\textit{{{convert_md_inline(s1_note)}}}\\\\[1.4cm]
        \\textbf{{{convert_md_inline(s1_n)}}}
    \\end{{center}}
\\end{{minipage}}
\\hfill
\\begin{{minipage}}[t]{{0.48\\textwidth}}
    \\begin{{center}}
        \\textbf{{{convert_md_inline(s2_t)}}}\\\\[0.1cm]
        \\textit{{{convert_md_inline(s2_note)}}}\\\\[1.4cm]
        \\textbf{{{convert_md_inline(s2_n)}}}
    \\end{{center}}
\\end{{minipage}}""")
            else:
                s_t, s_note, s_n, _ = sigs[idx]
                out.append(f"""\\hfill
\\begin{{minipage}}[t]{{0.50\\textwidth}}
    \\begin{{center}}
        \\textbf{{{convert_md_inline(s_t)}}}\\\\[0.1cm]
        \\textit{{{convert_md_inline(s_note)}}}\\\\[1.4cm]
        \\textbf{{{convert_md_inline(s_n)}}}
    \\end{{center}}
\\end{{minipage}}""")
        return "\n".join(out)
        
    return ""

def parse_markdown_doc(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_lines = [line.rstrip() for line in f]
        
    rel_md = os.path.relpath(md_path, DOCS_DIR)
    
    sigs, noi_nhan_lines, lines = parse_signatures_and_footer(raw_lines)
    
    agency_top = "CÔNG AN THÀNH PHỐ HÀ NỘI"
    agency_bot = "PHÒNG CẢNH SÁT HÌNH SỰ (PC02)"
    doc_num = "00/HS"
    date_str = "Hà Nội, ngày 25 tháng 07 năm 2016"
    title = "TÀI LIỆU VỤ ÁN"
    subtitle = ""
    
    # Pre-parse header cleanly
    header_parsed = False
    body_start_idx = 0
    
    for i, line in enumerate(lines[:30]):
        trimmed = line.strip()
        if not trimmed or trimmed == '---' or 'CỘNG HÒA' in trimmed or 'Độc lập' in trimmed:
            continue
            
        if trimmed.startswith('**CÔNG AN') or trimmed.startswith('CÔNG AN') or trimmed.startswith('NGÂN HÀNG') or trimmed.startswith('**NGÂN HÀNG'):
            clean_l = trimmed.replace('**', '').strip()
            if 'PHƯỜNG' in clean_l:
                agency_top = "CÔNG AN THÀNH PHỐ HÀ NỘI"
                agency_bot = clean_l
            else:
                agency_top = clean_l
            continue
            
        if trimmed.startswith('**CƠ QUAN') or trimmed.startswith('CƠ QUAN') or trimmed.startswith('**PHÒNG') or trimmed.startswith('PHÒNG') or trimmed.startswith('**CHI NHÁNH') or trimmed.startswith('CHI NHÁNH'):
            agency_bot = trimmed.replace('**', '').strip()
            continue
            
        if trimmed.startswith('Số:') or trimmed.startswith('**Số:'):
            doc_num = trimmed.replace('**', '').replace('Số:', '').replace('`', '').strip()
            continue
            
        if ('ngày ' in trimmed or 'hồi ' in trimmed) and ('tháng ' in trimmed or 'năm ' in trimmed):
            date_str = trimmed.replace('*', '').strip()
            continue
            
        if trimmed.startswith('# ') and 'CỘNG HÒA' not in trimmed:
            title = trimmed.replace('# ', '').strip()
            body_start_idx = i + 1
            # Check subtitle
            for next_idx in range(i + 1, min(i + 5, len(lines))):
                next_l = lines[next_idx].strip()
                if not next_l:
                    continue
                if (next_l.startswith('*(') or next_l.startswith('(')) and (next_l.endswith(')*') or next_l.endswith(')')):
                    subtitle = next_l.replace('*', '').strip()
                    body_start_idx = next_idx + 1
                break
            header_parsed = True
            break
            
    if not header_parsed:
        body_start_idx = 0
        if '05_ky_su_hau_an' in rel_md:
            title = "PHÍA SAU MỘT TỘI ÁC"
            subtitle = "(Hồi kết bi kịch và số phận những người trong cuộc)"
            
    body_lines = []
    list_stack = [] # stack of tuples: (list_type, level)
    table_rows = []
    in_code_block = False
    code_block_lines = []
    
    def close_lists_to_level(target_level=-1):
        lines_out = []
        while list_stack and (target_level < 0 or list_stack[-1][1] > target_level):
            ltype, _ = list_stack.pop()
            lines_out.append(f"\\end{{{ltype}}}")
        return lines_out

    i = body_start_idx
    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()
        
        # Skip repetitive headers in body
        if 'CỘNG HÒA' in trimmed or 'Độc lập' in trimmed or trimmed == '---':
            i += 1
            continue
            
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
            
        if trimmed.startswith('### '):
            body_lines.extend(close_lists_to_level(-1))
            heading_text = convert_md_inline(trimmed[4:].strip())
            body_lines.append(f"\n\\vspace{{0.3cm}}\\noindent\\textbf{{\\large {heading_text}}}\\\\[0.15cm]\n")
            i += 1
            continue
            
        if trimmed.startswith('#### '):
            body_lines.extend(close_lists_to_level(-1))
            heading_text = convert_md_inline(trimmed[5:].strip())
            body_lines.append(f"\n\\vspace{{0.2cm}}\\noindent\\textbf{{{heading_text}}}\\\\[0.1cm]\n")
            i += 1
            continue
            
        if trimmed.startswith('## '):
            body_lines.extend(close_lists_to_level(-1))
            heading_text = convert_md_inline(trimmed[3:].strip())
            if '═══' in heading_text or '---' in heading_text:
                i += 1
                continue
            body_lines.append(f"\n\\vspace{{0.35cm}}\\noindent\\textbf{{\\large {heading_text}}}\\\\[0.15cm]\n")
            i += 1
            continue
        
        if trimmed.startswith('# '):
            body_lines.extend(close_lists_to_level(-1))
            heading_text = convert_md_inline(trimmed[2:].strip())
            body_lines.append(f"\n\\vspace{{0.4cm}}\\noindent\\textbf{{\\large {heading_text}}}\\\\[0.2cm]\n")
            i += 1
            continue
            
        m_hoi = re.match(r'^\*\s*\*\*(Hỏi[^*]*):\*\*\s*(.*)$', trimmed)
        if m_hoi:
            body_lines.extend(close_lists_to_level(-1))
            q_name = convert_md_inline(m_hoi.group(1).strip())
            q_text = convert_md_inline(m_hoi.group(2).strip())
            body_lines.append(f"\\noindent\\textbf{{{q_name}:}} \\textit{{{q_text}}}\\\\[0.15cm]")
            i += 1
            continue
            
        m_dap = re.match(r'^\*\s*\*\*(Đáp[^*]*):\*\*\s*(.*)$', trimmed)
        if m_dap:
            body_lines.extend(close_lists_to_level(-1))
            a_name = convert_md_inline(m_dap.group(1).strip())
            a_text = convert_md_inline(m_dap.group(2).strip())
            body_lines.append(f"\\noindent\\textbf{{{a_name}:}} {a_text}\\\\[0.35cm]")
            i += 1
            continue
            
        indent = len(line) - len(line.lstrip())
        level = 1 if indent >= 2 else 0

        m_num_list = re.match(r'^(\d+)\.\s+(.*)$', trimmed)
        if m_num_list:
            item_content = convert_md_inline(m_num_list.group(2).strip())
            body_lines.extend(close_lists_to_level(level))
            if not list_stack or list_stack[-1][0] != 'enumerate' or list_stack[-1][1] != level:
                if list_stack and list_stack[-1][1] == level:
                    ltype, _ = list_stack.pop()
                    body_lines.append(f"\\end{{{ltype}}}")
                body_lines.append(r"\begin{enumerate}[label=\arabic*., leftmargin=*, itemsep=2pt, topsep=2pt, parsep=0pt]")
                list_stack.append(('enumerate', level))
            body_lines.append(f"  \\item {item_content}")
            i += 1
            continue
            
        if trimmed.startswith('* ') or trimmed.startswith('- ') or trimmed.startswith('• '):
            item_content = convert_md_inline(trimmed[2:].strip())
            body_lines.extend(close_lists_to_level(level))
            if not list_stack or list_stack[-1][0] != 'itemize' or list_stack[-1][1] != level:
                if list_stack and list_stack[-1][1] == level:
                    ltype, _ = list_stack.pop()
                    body_lines.append(f"\\end{{{ltype}}}")
                body_lines.append(r"\begin{itemize}[leftmargin=*, itemsep=2pt, topsep=2pt, parsep=0pt]")
                list_stack.append(('itemize', level))
            body_lines.append(f"  \\item {item_content}")
            i += 1
            continue
            
        if trimmed.startswith('|') and trimmed.endswith('|'):
            body_lines.extend(close_lists_to_level(-1))
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
            body_lines.extend(close_lists_to_level(-1))
            body_lines.append(convert_md_inline(trimmed) + "\n")
        else:
            body_lines.append("")
        i += 1
        
    body_lines.extend(close_lists_to_level(-1))
        
    footer_latex = format_footer_block(sigs, noi_nhan_lines)
    if footer_latex:
        body_lines.append(footer_latex)
        
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
    \\rule{{6cm}}{{0.6pt}}\\\\[0.5cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.3cm}}
"""
        return PREAMBLE + header + body_str + POSTAMBLE
        
    if '05_ky_su_hau_an' in rel_md:
        header = f"""% --- KÝ SỰ HẬU ÁN ---
\\begin{{center}}
    \\fontsize{{12pt}}{{14pt}}\\selectfont
    \\textbf{{KÝ SỰ HẬU ÁN — CHUYÊN ÁN MẠNG SỐ 14 ĐƯỜNG BỜ SÔNG}}\\\\[-0.2em]
    \\rule{{6cm}}{{0.6pt}}\\\\[0.5cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.3cm}}
"""
        return PREAMBLE + header + body_str + POSTAMBLE
        
    if '13_don_khoi_kien' in rel_md:
        header = f"""% --- ĐƠN KHỞI KIỆN ---
\\begin{{center}}
    \\fontsize{{11pt}}{{13pt}}\\selectfont
    \\textbf{{CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM}}\\\\
    \\textbf{{Độc lập - Tự do - Hạnh phúc}}\\\\[-0.2em]
    \\rule{{4cm}}{{0.6pt}}\\\\[0.5cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.3cm}}
"""
        return PREAMBLE + header + body_str + POSTAMBLE
        
    if '15_trich_doan_bai_bao' in rel_md or '10_so_ghi_no' in rel_md or '11_bang_tin_rao_vat' in rel_md or 'dev00' in rel_md or '01_so_thu_chi_quan_bia' in rel_md:
        header = f"""% --- TÀI LIỆU VẬT CHỨNG HIỆN TRƯỜNG ---
\\begin{{center}}
    \\fontsize{{11pt}}{{13pt}}\\selectfont
    \\textbf{{HỒ SƠ VẬT CHỨNG — CHUYÊN ÁN MẠNG SỐ 14 ĐƯỜNG BỜ SÔNG}}\\\\[-0.2em]
    \\rule{{6cm}}{{0.6pt}}\\\\[0.5cm]
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}
\\vspace{{0.3cm}}
"""
        return PREAMBLE + header + body_str + POSTAMBLE

    header = f"""% --- HEADER 2 CỘT CHUẨN NGHỊ ĐỊNH 30/2020/NĐ-CP ---
\\noindent
\\begin{{minipage}}[t]{{0.46\\textwidth}}
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

\\vspace{{0.5cm}}

\\begin{{center}}
    \\textbf{{\\Large {title_esc}}}\\\\[0.15cm]
    \\textit{{{subtitle_esc}}}
\\end{{center}}

\\vspace{{0.3cm}}
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
            
        tex_path = os.path.join(LATEX_DIR, tex_rel)
        os.makedirs(os.path.dirname(tex_path), exist_ok=True)
        
        print(f"Converting: {rel} -> {tex_rel}")
        tex_content = parse_markdown_doc(md_path)
        
        with open(tex_path, 'w', encoding='utf-8') as f:
            f.write(tex_content)
            
    print("\nAll LaTeX files successfully generated from Markdown!")

if __name__ == '__main__':
    build_all()

