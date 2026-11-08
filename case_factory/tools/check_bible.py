import sys, yaml

b = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
errs = []
chars = {c["key"] for c in b["characters"]}
events = {t["id"] for t in b["timeline"]}
ev = {e["code"] for e in b["evidence"]}
ded = {d["id"]: d for d in b["deductions"]}
stm = {s["id"]: s for s in b["statements"]}
dos = {d["key"] for d in b["dossiers"]}
cps = {c["id"] for c in b["checkpoints"]}

for e in b["evidence"]:
    if e["dossier"] not in dos: errs.append(f"{e['code']}: dossier {e['dossier']} missing")
    for t in e["from_events"]:
        if t not in events: errs.append(f"{e['code']}: event {t} missing")
for d in ded.values():
    for c in d["required"] + d["optional"]:
        if c not in ev: errs.append(f"{d['id']}: evidence {c} missing")
    if d["type"] not in ("identify",) and len(d["required"]) < 2:
        errs.append(f"{d['id']}: <2 required evidence")
    if d.get("subject") and d["subject"] not in chars: errs.append(f"{d['id']}: subject missing")
    bs = d.get("breaks_statement")
    if bs and bs not in stm: errs.append(f"{d['id']}: statement {bs} missing")
for s in stm.values():
    if s["document"] not in ev: errs.append(f"{s['id']}: document missing")
    if not s["truthful"] and s.get("exposed_by") not in ded: errs.append(f"{s['id']}: lie not exposed")
for c in b["checkpoints"]:
    for dep in c["depends_on"]:
        if dep not in cps: errs.append(f"{c['id']}: depends {dep} missing")
    for t in c["tests"]:
        if t not in ded: errs.append(f"{c['id']}: deduction {t} missing")
    u = c.get("unlocks_dossier")
    if u and u not in dos: errs.append(f"{c['id']}: dossier {u} missing")
for d in b["dossiers"]:
    if d["slot"] > 1 and d["unlocked_by"] not in cps | {"indictment"}:
        errs.append(f"{d['key']}: unlocked_by {d['unlocked_by']} missing")
used = {c for d in ded.values() for c in d["required"] + d["optional"]}
orphans = [e["code"] for e in b["evidence"] if e["code"] not in used and not e["is_red_herring"]]
print("ERRORS:", len(errs)); [print(" ", x) for x in errs]
print("Evidence not used by any deduction (info):", orphans)
print(f"chars={len(chars)} events={len(events)} evidence={len(ev)} deductions={len(ded)} checkpoints={len(cps)}")
