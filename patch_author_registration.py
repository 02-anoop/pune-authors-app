import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorRegistrationPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add required imports (useEffect)
if "useEffect" not in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

# 2. Add state for dynamic fields
dynamic_state_code = """  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [extraDataState, setExtraDataState] = useState<any>({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/author-fields`)
      .then(res => {
        const requiredFields = res.data.filter((f: any) => f.requiredForRegistration);
        setDynamicFields(requiredFields);
      })
      .catch(console.error);
  }, []);
"""

if "const [dynamicFields" not in content:
    content = content.replace("  const [paymentBlob, setPaymentBlob] = useState<File | null>(null);", "  const [paymentBlob, setPaymentBlob] = useState<File | null>(null);\n" + dynamic_state_code)

# 3. Render dynamic fields in Step 0
dynamic_ui_code = """
                  {dynamicFields.length > 0 && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Additional Required Information</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {dynamicFields.map(f => (
                          <div key={f.name}>
                            <label style={labelStyle}>{f.name} *</label>
                            {f.type === 'number' ? (
                              <input type="number" required style={inputStyle} value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            ) : f.type === 'date' ? (
                              <input type="date" required style={inputStyle} value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            ) : (
                              <input type="text" required style={inputStyle} value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
"""

if "{dynamicFields.length > 0 &&" not in content:
    content = content.replace("                  {/* Author photo upload */}", dynamic_ui_code + "\n                  {/* Author photo upload */}")

# 4. Add extraData validation before proceeding from Step 0
validation_code = """                      if (dynamicFields.length > 0) {
                        for (const f of dynamicFields) {
                          if (!extraDataState[f.name]) {
                            alert(`Please fill the required field: ${f.name}`); return;
                          }
                        }
                      }
"""
if "for (const f of dynamicFields)" not in content:
    content = content.replace(
        "if (!/^\\S+@\\S+\\.\\S+$/.test(form.email)) {",
        validation_code + "                      if (!/^\\S+@\\S+\\.\\S+$/.test(form.email)) {"
    )

# 5. Append extraData string to formData when submitting
form_data_append = """                      if (Object.keys(extraDataState).length > 0) {
                        formData.append("extraData", JSON.stringify(extraDataState));
                      }
"""
if 'formData.append("extraData"' not in content:
    content = content.replace(
        'if (paymentBlob) formData.append("paymentScreenshot", paymentBlob);',
        'if (paymentBlob) formData.append("paymentScreenshot", paymentBlob);\n' + form_data_append
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
