import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set IEEE conference styling
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']

fig, ax = plt.subplots(figsize=(14, 8), dpi=300)
ax.set_xlim(0, 14)
ax.set_ylim(0, 9)
ax.axis('off')

# Background canvas
bg_rect = patches.Rectangle((0, 0), 14, 9, facecolor='#ffffff', edgecolor='none')
ax.add_patch(bg_rect)

# Tier definitions: (title, y_start, height, color_border, color_bg)
tiers = [
    ("Tier 1: Patient Interaction & Multimodal Input Tier", 7.0, 1.6, "#1f4e79", "#f0f4f8"),
    ("Tier 2: Multilingual NLP, Normalization & Signal Bridge Tier", 4.8, 1.8, "#2b6cb0", "#f7fafc"),
    ("Tier 3: Clinical Intelligence & Machine Learning Triage Tier", 2.6, 1.8, "#2c7a7b", "#f0fff4"),
    ("Tier 4: Telehealth Actuation, Neural Synthesis & Fulfillment Tier", 0.4, 1.8, "#744210", "#fffaf0")
]

for title, y, h, border, bg in tiers:
    rect = patches.FancyBboxPatch((0.4, y), 13.2, h, boxstyle="round,pad=0.12",
                                  facecolor=bg, edgecolor=border, linewidth=1.5, linestyle="--")
    ax.add_patch(rect)
    ax.text(0.6, y + h - 0.28, title, fontsize=11, fontweight='bold', color=border)

# Helper function to draw modules
def draw_box(x, y, w, h, title, subtitle, fill_c, text_c="#0b2240", border_c="#1f4e79"):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08",
                                 facecolor=fill_c, edgecolor=border_c, linewidth=1.2)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2 + 0.12, title, fontsize=9.5, fontweight='bold',
            ha='center', va='center', color=text_c)
    ax.text(x + w/2, y + h/2 - 0.18, subtitle, fontsize=7.5,
            ha='center', va='center', color="#4a5568")

# Helper function for arrows
def draw_arrow(x1, y1, x2, y2, color="#4a5568", style="->", rad=0.0):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=1.5,
                                connectionstyle=f"arc3,rad={rad}"))

# Tier 1 Components
draw_box(0.8, 7.2, 3.6, 0.9, "Multimodal Speech ASR", "Web Speech API (en-IN, hi-IN, mr-IN)", "#ffffff")
draw_box(5.2, 7.2, 3.6, 0.9, "Responsive Web & Mobile UI", "React 18 Dashboard & Chat Interface", "#ffffff")
draw_box(9.6, 7.2, 3.6, 0.9, "Interactive Neural Avatar", "WebRTC Video Stream / D-ID Interface", "#ffffff")

# Tier 2 Components
draw_box(0.8, 5.0, 3.8, 1.1, "Trilingual Translation & Script", "Google Translate API + Devanagari Mapping\n[Marathi / Hindi -> English Bridge]", "#e6f6ff")
draw_box(5.1, 5.0, 3.8, 1.1, "Clinical Named Entity Recognition", "Disease, Symptom, Anatomy, Dosage\nRegex + spaCy Biomedical Entity Pipeline", "#e6f6ff")
draw_box(9.4, 5.0, 3.8, 1.1, "Sentiment & Urgency Scoring", "VADER Polarity + Clinical Triage Lexicon\n[Urgency: Low / Moderate / Emergency]", "#e6f6ff")

# Tier 3 Components
draw_box(0.8, 2.8, 4.0, 1.1, "TF-IDF Vectorization Engine", "5,000 n-gram features (uni+bi-grams)\nInverse Document Frequency Weighting", "#e6fffa")
draw_box(5.1, 2.8, 4.0, 1.1, "Ensemble ML Intent Classifier", "Random Forest (95.65% Acc, 0.95 F1)\n6 Clinical Classes (Pain, Fever, Stomach, etc.)", "#d4edda", border_c="#28a745")
draw_box(9.4, 2.8, 3.8, 1.1, "Clinical Decision Triage Tree", "Evidence-based guidelines & Red-flag\nEmergency Protocol (108 Ambulance Dispatch)", "#e6fffa")

# Tier 4 Components
draw_box(0.8, 0.6, 3.8, 1.1, "Neural Text-To-Speech (TTS)", "Google Cloud Wavenet (hi-IN, mr-IN, en-US)\nDynamic chunking & female voice synthesis", "#fffaf0")
draw_box(5.1, 0.6, 3.8, 1.1, "Interactive Video Synthesis", "D-ID Talk Streams + Idle Animation Loop\nReal-time lip-synced medical avatar", "#fffaf0")
draw_box(9.4, 0.6, 3.8, 1.1, "Geo-Pharmacy & Relational Store", "OpenStreetMap / Google Places API\nMongoDB / SQLite History & Booking", "#fffaf0")

# Inter-tier connections
draw_arrow(2.6, 7.2, 2.7, 6.1)
draw_arrow(7.0, 7.2, 7.0, 6.1)
draw_arrow(11.4, 7.2, 11.3, 6.1)

draw_arrow(2.7, 5.0, 2.8, 3.9)
draw_arrow(4.8, 3.35, 5.1, 3.35)
draw_arrow(7.0, 5.0, 7.1, 3.9)
draw_arrow(9.1, 3.35, 9.4, 3.35)
draw_arrow(11.3, 5.0, 11.3, 3.9)

draw_arrow(2.8, 2.8, 2.7, 1.7)
draw_arrow(7.1, 2.8, 7.0, 1.7)
draw_arrow(11.3, 2.8, 11.3, 1.7)

# Title
ax.text(7.0, 8.7, "Figure 1: MediMitra End-to-End System Architecture Pipeline",
        fontsize=13, fontweight='bold', ha='center', color="#0b2240")

plt.tight_layout()
plt.savefig('figures/fig1_system_architecture.png', dpi=300, bbox_inches='tight', facecolor='white')
print("Successfully generated fig1_system_architecture.png")
