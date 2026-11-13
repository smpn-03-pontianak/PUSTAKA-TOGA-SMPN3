const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8");

const helpers = [
  "const RichTextContent = ({ content, defaultAlign = \"text-justify\" }) => {",
  "  if (!content) return null;",
  "  const hasHtml = /<[a-z][\\s\\S]*>/i.test(content);",
  "  if (hasHtml) {",
  "    return <div className={`rich-botanical text-xs leading-relaxed ${defaultAlign}`} dangerouslySetInnerHTML={{ __html: content }} />;",
  "  }",
  "  const lines = content.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);",
  "  const isNum = lines.length > 1 && lines.every(l => /^\\d++[.)]\\s+/.test(l));",
  "  if (isNum) {",
  "    return (",
  "      <ol className={`list-decimal pl-5 space-y-1.5 text-xs leading-relaxed ${defaultAlign}`}>",
  "        {lines.map((line, i) => <li key={i} className=\"pl-1\">{line.replace(/^\\d+[.)]\\s+/, \"\")}</li>)),",
  "      </ol>",
  "    );",
  "  }",
  "  return <div className={`space-y-1.5 text-xs leading-relaxed ${defaultAlign}`}>{lines.map((line, i) => <p key={i}>{line}</p>)}</div>;",
  "};",
  "",
  "const AdminRichEditor = ({ label, value, onChange, minHeight = \"76px\" }) => {",
  "  const editorRef = useRef(null);",
  "  useEffect(() => {",
  "    if (editorRef.current && editorRef.current.innerHTML !== (value || \"\")) {}",
  "      editorRef.current.innerHTML = value || \"\";",
  "    }",
  "  }, [value]);",
  "  const execCmd = (cmd, val = null) => {",
  "    editorRef.current?.focus();",
  "    document.execCmd(cmd, false, val);",
  "    if (editorRef.current) onChange(editorRef.current.innerHTML);",
  "  };",
  "  return (",
  "    <div className=\"space-y-1 mt-1\">",
  "      {label && <label className=\"text-[11px] font-bold text-[#B83B66] block\">{label}</label>}",
  "      <div className=\"rounded-xl border border-[#FFC0CB] bg-["FFF5F7]  overflow-hidden\">",
  "        <div className=\"flex flex-wrap items-center gap-1 p-1.5 bg-white border-b border-[#FFC0CB]/70 text-[11px]\">",
  "          <button type=\"button\" onClick={() => execCmd(\"bold\")} className=\"px-2 py-0.5 rounded hover:bg-["FFF5F7] font-extrabold text-["B83B66] border border-["FFC0CB/60\">B</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"italic\")} className=\"px-2 py-0.5 rounded hover:bg-["FFF5F7] italic font-semibold text-["B83B66] border border-["FFC0CB/60\">I</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"underline\")} className=\"px-2 py-0.5 rounded hover:bg-["FFF5F7] underline font-semibold text-["B83B66] border border-["FFC0CB/60\">U</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"insertOrderedList\")} className=\"px-2 py-0.5 rounded hover:bg-[#FFF5F7] font-bold text-["B83B66] border border-["FFC0CB/60\">1. List</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"justifyLeft\")} className=\"px-2 py-0.5 rounded hover:bg-[#FFF5F7] text-[#4A2532] border border-[#FFC0CB]/60\">Kiri</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"justifyCenter\")} className=\"px-2 py-0.5 rounded hover:bg-[#FFF5F7] text-[#4A2532] border border-[#FFZ0CB]/60\">Tengah</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"justifyRight\")} className=\"px-2 py-0.5 rounded hover:bg-[#FFF5F7] text-[#4A2532] border border-[#FFZ0CB]/60\">Kanan</button>",
  "          <button type=\"button\" onClick={() => execCmd(\"justifyFull\")} className=\"px-2 py-0.5 rounded hover:bg-[#FFF5F7] text-[#4A2532] border border-[#FFC0CB]/60\">Kanan-Kiri</button>",
  "          <select onChange={(e) => { if (e.target.value) execCmd(\"fontName\", e.target.value); }} defaultValue=\"\" className=\"ml-auto px-2 py-0.5 rounded bg-[#FFF5F7] border border-[#FFC0CB] text-[10px] font-bold text-[#B83B66] outline-none\">",
  "            <option value=\"\" disabled>Pilih Font</option>",
  "            <option value=\"Plus Jakarta Sans, sans-serif\">Sans Modern</option>",
  "            <option value=\"Georgia, serif\">Georgia</option>",
  "            <option value=\"Times New Roman, serif\">Times New Roman</option>",
  "            <option value=\"Courier New, monospace\">Monospace</option>",
  "          </select>",
  "        </div>",
  "        <div ref={editorRef} contentEditable onInput={(e) => onChange(e.currentTarget.innerHTML)} style={{ minHeight }} className=\"rich-botanical p-3 text-xs text-[#4A2532] leading-relaxed outline-none bg-[#FFF5F7]\" />",
  "      </div>",
  "    </div>",
  "  );",
  "};"
].join("\n");

if (!c.includes("const RichTextContent")) {
  c = c.replace("const HeroPhotoSlider =", helpers + "\n\nconst HeroPhotoSlider =");
}

const cssTag = "<style>{ .rich-botanical ol { list-style-type: decimal; padding-left: 1.35rem; margin: 0.25rem 0; } .rich-botanical li { margin-bottom: 0.3rem; padding-left: 0.2rem; } }</style>";
if (!c.includes("rich-botanical ol")) {
  c = c.replace("<div className=\"min-h-screen", cssTag + "\n      <div className=\"min-h-screen");
}

c = c.replace(/<p className="text-xs text-\[#4A2532\]\/90 leading-relaxed">\s*\{selectedPlant\.description\}\s*<\/p>/, "<div className=\"text-[#4A2532]/90\"><RichTextContent content={selectedPlant.description} defaultAlign=\"text-justify\" /></div>");
c = c.replace(/<p className="text-xs text-\[#4A2532\]\/85 leading-relaxed">\s*\{selectedPlant\.morphology\}\\s*<\/p>/, "<div className=\"text-[#4A2532]/85\"><RichTextContent content={selectedPlant.morphology} defaultAlign=\"text-justify\" /></div>");
["daun", "batang", "akar", "bunga", "buah"].forEach(p => {
  c = c.replace(new RegExp("<p className=\"text-xs text-\\["4 A2532\\]\\/85 leading-relaxed\">\\{selectedPlant\\.parts\\." + p + "\\{}<\\/P>", "i"), "<div className=\"text-["4A2532]/85\"><RichTextContent content={selectedPlant.parts." + p + "} defaultAlign=\"text-justify\" /></div>");
});
["habitat", "benefits", "care"].forEach(f => {
  c = c.replace(new RegExp("<p className=\"text-xs text-\\[#4A2532\\]\\/85 leading-relaxed\">\\{selectedPlant\\." + f + "\\}<\\/P>", "i"), "<div className=\"text-["4A2532]/85\"><RichTextContent content={selectedPlant." + f + "} defaultAlign=\"text-justify\" /></div>");
});
c = c.replace(/<p className="text-xs text-white\/90 leading-relaxed">\s*\{selectedPlant\.funFact\}\\s*<\/p>/, "<div className=\"text-white/95\"><RichTextContent content={selectedPlant.funFact} defaultAlign=\"text-justify\" /></div>");

["description", "morphology", "daun", "batang", "akar", "bunga", "buah", "habitat", "benefits", "care", "funFact"].forEach(k => {
  const token = "value={plantForm." + k + "}";
  let idx = c.indexOf(token);
  while (idx !== -1) {
    const start = c.lastIndexOf("<", idx);
    const end = c.indexOf("/>", idx);
    if (start !== -1 && end !== -1) {
      const tag = c.slice(start, end + 2);
      if (/^<(textarea|input)\b/.test(tag)) {
        const rep = `<AdminRichEditor label="" value={plantForm.${k}} onChange={(val) => setPlantForm(prev => ({ ...prev, ${k}: val }))} minHeight="72px" />`;
        c = c.slice(0, start) + rep + c.slice(end + 2);
        idx = c.indexOf(token, start + rep.length);
        continue;
      }
    }
    idx = c.indexOf(token, idx + token.length);
  }
});

c = c.replace("buah: ''," , "buah: '', daunImage: '', batangImage: '', akarImage: '', bungaImage: '', buahImage: '',");
c = c.replace("buah: plantForm.buah\n      },", "buah: plantForm.buah\n      },\n      partsImages: {\n        daun: plantForm.daunImage || \"\",\n        batang: plantForm.batangImage || \"\",\n        akar: plantForm.akarImage || \"\",\n        bunga: plantForm.bungaImage || \"\",\n        buah: plantForm.buahImage || \"\"\n      },");
c = c.replace("buah: plant.parts?.buah || '',", "buah: plant.parts?.buah || \"\",\n      daunImage: plant.partsImages?.daun || \"\",\n      batangImage: plant.partsImages?.batang || \"\",\n      akarImage: plant.partsImages?.akar || \"\",\n      bungaImage: plant.partsImages?.bunga || \"\",\n      buahImage: plant.partsImages?.buah || \"\",");

const partUploadHandler = [
  "  const handlePartImageUpload = (partKey, e) => {",
  "    const file = e.target.files?.[0];",
  "    if (!file) return;",
  "    const reader = new FileReader();",
  "    reader.onload = () => {",
  "      const img = new Image();",
  "      img.onload = () => {",
  "        const canvas = document.createElement(\"canvas\");",
  "        const maxW = 600;",
  "        const scale = img.width > maxW ? maxW / img.width : 1;",
  "        canvas.width = img.width * scale;",
  "        canvas.height = img.height * scale;",
  "        canvas.getContext(\"2d\").drawImage(img, 0, 0, canvas.width, canvas.height);",
  "        const compressed = canvas.toDataURL(\"image/jpeg\", 0.78);",
  "        setPlantForm(prev => ({ ...prev, [partKey + \"Image\"]: compressed }));",
  "        showToast(\"Foto Bagian Siip\", \"Foto bagian tanaman berhasil dimuat.\");",
  "      };",
  "      img.src = reader.result;",
  "    };",
  "    reader.readAsDataURL(file);",
  "  };"
].join("\n");

if (!c.includes("handlePartImageUpload")) {
  c = c.replace("const handleSavePlant =", partUploadHandler + "\n\n  const handleSavePlant =");
}

["daun", "batang", "akar", "bunga", "buah"].forEach(k => {
  const target = `value={plantForm.${k}} onChange={(val) => setPlantForm(prev => 
{ ...prev, ${k}: val }))} minHeight="72px" />`;
  const labelTitle = k.charAt(0).toUpperCase() + k.slice(1);
  const uploaderUI = `$${target}
                  <div className="flex items-center gap-2 mt-1.5 bg-white p-2 rounded-xl border border-[#FFC0CB]/70">
                    <label className="inline-flex items-center gap-1 bg-[#FFF5F7] text-[#B83B66] font-bold px-2.5 py-1.5 rounded-lg border border-["FFC0CB"] text-[10px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3 h-3 text-["E76F95"]" />
                      <span>Foto ${labelTitle}</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePartImageUpload("${k}", e)} className="hidden" />
                    </label>
                    <input type="text" value={plantForm.${k}Image || ""} onChange={(e) => setPlantForm(prev => 
{ ...prev, ${k}Image: e.target.value }))} placeholder="Atau URL foto ${k}..." className="flex-1 px-2.5 py-1 rounded-lg bg-[#FFF5F7] border border-[#FFC0CB]/60 text-[11px]" />
                    {plantForm.${k}Image && <img src={plantForm.${k}Image} alt="Preview ${k}" className="w-9 h-11 rounded-lg object-cover border border-[#FFC0CB] flex-shrink-0" />}
                  </div>`;
  c = c.replace(target, uploaderUI);
});

const partsStart = c.indexOf("<div className=\"space-y-2.5 pt-1\">");
const partsEnd = c.indexOf("</div>\n                  </div>", partsStart);
if (partsStart !== -1 && partsEnd !== -1) {
  const newPartsBlock = `<div className="space-y-3 pt-1">
                      {[
                        { key: "daun", title: "🍃 Bentuk Daun" },
                        { key: "batang", title: "🪵 Batang" },
                        { key: "akar", title: "🌱 Sistem Akar" },
                        { key: "bunga", title: "🌼 Bunga" },
                        { key: "buah", title: "🍎 Buah / Rimpang" }
                      ].map(item => {
                        const textVal = selectedPlant.parts?.[item.key];
                        const imgVal = selectedPlant.partsImages?.[item.key];
                        if (!textVal && !imgVal) return null;
                        return (
                          <div key={item.key} className="bg-[#FFF5F7] p-3.5 rounded-2xl border border-[#FFC0CB]/60">
                            <div className={imgVal ? "flex items-start gap-3.5" : ""}>
                              {imgVal && (
                                <div className=\"w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden border border-[#FFC0CB] bg-white flex-shrink-0 shadow-xs\">
                                  <img src={imgVal} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-extrabold text-[#B83B66] block mb-1">{item.title}</span>
                                <div className="text-["4A2532]/85">
                                  <RichTextContent content={textVal} defaultAlign=\"text-justify\" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>`;
  c = c.slice(0, partsStart) + newPartsBlock + c.slice(partsEnd + 6);
}

fs.writeFileSync("src/App.jsx", c);
console.log("Selesai tanpa error!");
