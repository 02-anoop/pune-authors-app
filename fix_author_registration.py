import re

with open('src/app/components/AuthorRegistrationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports and QR code
if 'import qrCode' not in content:
    content = content.replace('import { CheckCircle', 'import qrCode from "./data/qr_code.jpeg";\nimport { CheckCircle')

# 2. Add payment blobs
state_old = '''  const [coverBlob, setCoverBlob] = useState<File | null>(null);
  const [authorBlob, setAuthorBlob] = useState<File | null>(null);'''

state_new = '''  const [coverBlob, setCoverBlob] = useState<File | null>(null);
  const [authorBlob, setAuthorBlob] = useState<File | null>(null);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [paymentBlob, setPaymentBlob] = useState<File | null>(null);'''

content = content.replace(state_old, state_new)

# 3. Add transactionId, remove card stuff
form_old = '''    cardNum: "",
    cardName: "",
    expiry: "",
    cvv: "",'''

form_new = '''    transactionId: "",'''

content = content.replace(form_old, form_new)

# 4. Replace Step 3 entirely
step3_old = '''            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Application Fee Payment</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>A one-time registration fee of ₹2,000 secures your PAA membership and editorial review.</p>

                {/* Mock payment card */}
                <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d50 100%)", borderRadius: 18, padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                  <div style={{ position: "absolute", bottom: -40, left: 60, width: 100, height: 100, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>PAA MEMBERSHIP APPLICATION</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#fff", letterSpacing: "0.25em", marginBottom: "1.5rem" }}>
                    {form.cardNum.replace(/(.{4})/g, "$1 ").trim() || "•••• •••• •••• ••••"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: "0.2rem" }}>CARDHOLDER</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#fff", fontWeight: 500 }}>{form.cardName || form.name || "YOUR NAME"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: "0.2rem" }}>EXPIRES</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#fff" }}>{form.expiry || "MM/YY"}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Card Number</label>
                    <input type="text" maxLength={16} placeholder="1234 5678 9012 3456" value={form.cardNum} onChange={(e) => update("cardNum", e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Name on Card</label>
                    <input type="text" placeholder="Full name as on card" value={form.cardName} onChange={(e) => update("cardName", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength={5} value={form.expiry} onChange={(e) => update("expiry", e.target.value)} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV</label>
                      <input type="password" placeholder="•••" maxLength={3} value={form.cvv} onChange={(e) => update("cvv", e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem", marginTop: "1rem", fontSize: 12, color: "#166534" }}>
                  <strong>Application Fee:</strong> ₹2,000 + GST = ₹2,360 (one-time)<br />
                  Your application will be reviewed within 5-7 business days. You will be notified via email once approved.
                </div>
              </div>
            )}'''

step3_new = '''            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" }}>Application Fee Payment</h2>
                <p style={{ fontSize: 13, color: "#6b6b80", marginBottom: "1.75rem" }}>A one-time registration fee of ₹500 secures your PAA membership and editorial review.</p>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                  <img src={qrCode} alt="Payment QR" style={{ width: 200, height: 200, borderRadius: 12, border: "2px solid #e5e7eb" }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginTop: "0.5rem" }}>Scan QR to Pay ₹500</p>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Transaction ID *</label>
                    <input type="text" required placeholder="e.g. T23456789012" value={form.transactionId} onChange={(e) => update("transactionId", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Payment Screenshot *</label>
                    <div
                      style={{ border: "2px dashed rgba(0,0,0,0.12)", borderRadius: 12, padding: "1.5rem", textAlign: "center", background: "#f7f7f9", cursor: "pointer" }}
                      onClick={() => document.getElementById("payment-screenshot-upload")?.click()}
                    >
                      {paymentScreenshotUrl ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                          <img src={paymentScreenshotUrl} alt="screenshot preview" style={{ height: 60, objectFit: "contain", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Screenshot uploaded ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} color="#6b6b80" style={{ margin: "0 auto 0.5rem" }} />
                          <div style={{ fontSize: 13, color: "#6b6b80" }}>Click to upload payment screenshot</div>
                        </>
                      )}
                    </div>
                    <input
                      id="payment-screenshot-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPaymentBlob(file);
                          setPaymentScreenshotUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem", marginTop: "1rem", fontSize: 12, color: "#166534" }}>
                  <strong>Application Fee:</strong> ₹500 (one-time minimum fee)<br />
                  Your application will be reviewed within 5-7 business days. You will be notified via email once approved.
                </div>
              </div>
            )}'''

content = content.replace(step3_old, step3_new)

# Add validations before next step
continue_old = '''onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}'''
continue_new = '''onClick={() => {
                    if (step === 0) {
                      if (!form.name || !form.email || !form.phone || !form.password || !form.bio || !authorBlob) {
                        alert("Please fill all compulsory fields in this step and upload photo."); return;
                      }
                      if (!/^\S+@\S+\.\S+$/.test(form.email)) {
                        alert("Please enter a valid email address."); return;
                      }
                      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
                        alert("Please enter a valid 10-digit phone number."); return;
                      }
                    } else if (step === 1) {
                      if (!form.title || !form.genre || !form.synopsis || !form.mrp || !coverBlob) {
                        alert("Please fill all compulsory fields in this step and upload book cover."); return;
                      }
                    }
                    setStep((s) => Math.min(steps.length - 1, s + 1));
                  }}'''
content = content.replace(continue_old, continue_new)

# Add validations before submitting
submit_old = '''                    if (!form.guidelinesChecked || !form.conflictChecked) {
                      alert("Please accept all agreements before submitting.");
                      return;
                    }'''
submit_new = '''                    if (!form.guidelinesChecked || !form.conflictChecked) {
                      alert("Please accept all agreements before submitting.");
                      return;
                    }
                    if (!form.transactionId || !paymentBlob) {
                      alert("Please provide the transaction ID and upload the payment screenshot.");
                      return;
                    }'''
content = content.replace(submit_old, submit_new)

# Add paymentBlob to formData
fd_old = '''                      if (coverBlob) formData.append("cover", coverBlob);'''
fd_new = '''                      if (coverBlob) formData.append("cover", coverBlob);
                      if (paymentBlob) formData.append("paymentScreenshot", paymentBlob);'''
content = content.replace(fd_old, fd_new)

with open('src/app/components/AuthorRegistrationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthorRegistrationPage successfully")
