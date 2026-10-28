# Anthony Aughenbaugh — Engineering & Manufacturing Consulting

Portfolio and consulting website for Anthony Aughenbaugh, Manufacturing Engineer based in Northern Illinois.

## Tech Stack
- HTML5 / Semantic Web
- Vanilla CSS (custom design system)
- Vanilla JavaScript


## Setup & Local Development
Open `index.html` directly in a browser or serve using any static file server:
```bash
# Example with Python:
python -m http.server 8000
```

## Gallery Style & Labeling Guide (NG Solutions Reference)
The project and gallery cards follow the **NG Solutions** card layout design pattern:
- **Visual Reference**: [assets/gallery-style-guide.jpg](assets/gallery-style-guide.jpg)
- **Container**: Responsive CSS grid (`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`, `gap: 1.5rem`).
- **Card**:
  - `aspect-ratio: 16 / 10` (or `4 / 3`)
  - `border-radius: 12px`
  - Subtle dark surface border (`border: 1px solid var(--line)`)
  - Smooth hover scale effect on image (`transform: scale(1.05)`)
- **Bottom Gradient Overlay**:
  - `linear-gradient(to top, rgba(11, 17, 24, 0.95) 0%, rgba(11, 17, 24, 0.72) 42%, rgba(11, 17, 24, 0.2) 70%, transparent 100%)`
- **Typography**:
  1. **Primary Title**: Bold White text (`color: #FFFFFF`, `font-weight: 700`, `font-size: 1.125rem`, `line-height: 1.3`).
  2. **Subtitle / Category Tag**: Electric Cyan / Light Blue uppercase text (`color: #38bdf8`, `font-weight: 700`, `font-size: 0.78rem`, `letter-spacing: 0.06em`, `text-transform: uppercase`).

### Photo to Label Mapping (assets/photos/)
| Photo | Primary Title (Bold White) | Subtitle / Tag (Cyan Uppercase) |
|---|---|---|
| `IMG_5509.jpeg` | Plant Layout & Workflow Modeling | FACILITY & CAPACITY ANALYSIS |
| `IMG_5659.jpeg` | SolidWorks Manifold CAD Assembly | CAMWORKS & PARAMETRIC DESIGN |
| `IMG_5998.jpeg` | Billet Aluminum Intake Manifold | PRECISION CNC & TIG FABRICATION |
| `IMG_5954.jpeg` | Precision Bronze Tooling Plate | CLOSE-TOLERANCE CNC MILLING |
| `IMG_5963.jpeg` | ASTM D3359 Coating Adhesion Testing | QUALITY CONTROL & SURFACE QA |
| `IMG_5042.jpeg` | 5S Collet & Tooling System | WORKSTATION OPTIMIZATION |
| `IMG_6252.jpeg` | Formed Channel Mounting Brackets | PRESS BRAKE & SHEET METAL |
| `IMG_6396.jpeg` | Chassis Shroud Fabrication | PRECISION FORMING & FINISHING |
| `IMG_4997.jpeg` | Mobile CNC Toolholder Management | SHOP FLOOR LOGISTICS |
| `IMG_5297.jpeg` | Ergonomic Assembly Workstation | LEAN CELL DESIGN |
| `IMG_5850.jpeg` | Custom Formed Structural Bracket | SHEET METAL PROTOTYPING |
| `IMG_5815.jpeg` | Precision CNC Fixturing Setup | PROCESS PLANNING & RIGIDITY |
