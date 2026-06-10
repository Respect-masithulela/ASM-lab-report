'use strict';
const {W,C,borders,pad,padS,t,tb,ti,tm,p,pc,h1,h2,h3,sp,eq,bul,num_,divider,figNote,tabNote,figPH,hc,dc,mc,box,ref_} = require('./report_helpers');
const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle,
        WidthType, ShadingType, LevelFormat, PageBreak, VerticalAlign, HeadingLevel } = require('docx');

const children = [];
const add = (...items) => children.push(...items);

// ── TITLE ──────────────────────────────────────────────────────────────────
add(
  new Paragraph({spacing:{before:480,after:80},children:[new TextRun({text:"ASM LAB MINE VENTILATION SIMULATION SOFTWARE",font:"Arial",size:52,bold:true,color:C.navy,allCaps:true})]}),
  new Paragraph({spacing:{before:0,after:40},children:[new TextRun({text:"Development, Validation and Technical Documentation",font:"Arial",size:28,color:C.blue})]}),
  new Paragraph({spacing:{before:0,after:280},children:[new TextRun({text:"A Final Year Project Report submitted in partial fulfilment of the requirements for the degree of Bachelor of Science in Engineering (Mining Engineering) at the University of the Witwatersrand, Johannesburg",font:"Arial",size:22,italics:true,color:C.grey})]}),
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({children:[new TableCell({borders:borders(C.blue),width:{size:W,type:WidthType.DXA},margins:{top:140,bottom:140,left:240,right:240},shading:{fill:C.bgBlue,type:ShadingType.CLEAR},children:[
    pc([tb("Author: ",{color:C.blue}),t("Respect Pfariso Masithulela  |  Student Number: 2716736")]),
    pc([tb("Degree: ",{color:C.blue}),t("BSc (Engineering) Mining Engineering")]),
    pc([tb("School: ",{color:C.blue}),t("School of Mining Engineering, University of the Witwatersrand, Johannesburg")]),
    pc([tb("Supervisor: ",{color:C.blue}),t("Mr M. Mochubele")]),
    pc([tb("Date: ",{color:C.blue}),t("May 2026")]),
  ]})]})]}),
  sp(200),
  box("Declaration",C.navy,"EEF4FB",[
    p([t("I declare that this report is my own unaided work. It is submitted in partial fulfilment of the requirements for the degree of Bachelor of Science in Engineering at the University of the Witwatersrand, Johannesburg. It has not been submitted before for any degree or examination at any other university.")]),
    sp(80),
    p([t("Signature: _______________________________     Date: _______________")]),
  ]),
  new Paragraph({children:[new PageBreak()]}),
);

// ── ABSTRACT ───────────────────────────────────────────────────────────────
add(
  new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:0,after:160},children:[new TextRun({text:"Abstract",font:"Arial",size:34,bold:true,color:C.navy})]}),
  p([t("Mine ventilation simulation software is a critical tool for the design, compliance assessment, and optimisation of underground mine ventilation systems. In South Africa, the Mine Health and Safety Act (No. 29 of 1996) imposes strict legislative obligations on mine operators regarding underground thermal conditions, gas concentrations, and airflow quantities. Compliance with these requirements demands simulation capability that is currently provided exclusively by commercial tools — Ventsim Design, VentGraph, and VUMAnetwork — whose licensing costs place them beyond the financial reach of small-scale and junior mining operations.")]),
  sp(40),
  p([t("This report documents the development and validation of the ASM Lab Mine Ventilation Simulation Software, a purpose-built, accessible platform targeting small-scale and medium-scale underground mining operations in South Africa. The platform is implemented as a native desktop application using Python and PySide6, with a TypeScript/React stope simulator component. It encompasses a network-level ventilation solver, a 3D stope cellular solver, a psychrometric engine, a dust agent-based model (ABM), fan curve analysis, and a compliance report generator.")]),
  sp(40),
  p([t("The core network solver employs a graph reduction architecture that analytically solves series and parallel subnetworks before applying an iterative residual solver to irreducible mesh sections. This approach — not used in any current commercial tool — was verified correct against manual Atkinson calculations on a ten-node stress-test network with opposing fans, a high-resistance cross-cut at 1,200 times the resistance of standard airways, and a dead-end spur. Mass balance was confirmed exact at all nodes. Pressure values matched manual calculation to four significant figures.")]),
  sp(40),
  p([t("The stope simulator implements a High-Resolution Distributed Parameter Cellular Network Solver (HR-DPCNS) using a Darcy pressure-Poisson formulation solved by Red-Black Successive Over-Relaxation. Four critical numerical bugs — an auto-compression depth proxy error causing a fictitious 15°C temperature spike, a fixed-iteration psychrometric march that failed on recirculation loops, Gauss-Seidel stalling at high resistance contrast, and first-order velocity splatting causing spurious numerical diffusion in the dust model — were identified, documented, and corrected. The dust ABM was upgraded to use trilinear face-flux velocity interpolation, reducing spurious diffusion from O(h|v|) to O(h²|∇v|).")]),
  sp(40),
  p([t("Fan curve analysis is implemented using linear interpolation on P-Q-W-η data points with density correction, affinity law scaling, series and parallel combination, and Newton-bisection operating point determination. Twelve synthetic reference fans covering 5.5 kW to 75 kW were generated using the parametric axial fan model for academic validation.")]),
  sp(40),
  p([t("The platform matches Ventsim Design in core airflow physics and exceeds it in stope-scale cellular simulation and dust transport accuracy. Primary functional gaps relative to commercial tools — psychrometric coupling completion, refrigeration circuits, and the compliance report generator — are documented with a 12-week remediation roadmap.")]),
  sp(40),
  p([tb("Keywords: ",{color:C.navy}),t("mine ventilation, graph reduction, Atkinson equation, psychrometrics, agent-based modelling, Darcy flow, HR-DPCNS, PySide6, small-scale mining, South Africa")]),
  new Paragraph({children:[new PageBreak()]}),
);

// ── ACKNOWLEDGEMENTS ───────────────────────────────────────────────────────
add(
  new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:0,after:160},children:[new TextRun({text:"Acknowledgements",font:"Arial",size:34,bold:true,color:C.navy})]}),
  p([t("The author wishes to express sincere gratitude to Mr M. Mochubele for his guidance, patience, and consistently direct feedback throughout the supervision process. His insistence that a problem statement must start with the actual problem — and that literature review means engaging the literature, not describing it — shaped both the technical direction and the academic rigour of this project in ways that would not have emerged without that pressure.")]),
  sp(40),
  p([t("The author also acknowledges the School of Mining Engineering at the University of the Witwatersrand for providing access to academic resources and industry contacts that informed the technical benchmarking in this report.")]),
  new Paragraph({children:[new PageBreak()]}),
);

// ── CH1 INTRODUCTION ───────────────────────────────────────────────────────
add(h1("Chapter 1:  Introduction"));
add(h2("1.1  Background and Motivation"));
add(
  p([t("Underground mining in South Africa operates within one of the most thermally demanding and legally regulated environments in the world. The combination of increasing depth, high ambient rock temperatures, diesel-powered mechanised equipment, and the necessity of complying with the Mine Health and Safety Act (No. 29 of 1996) creates an engineering environment where accurate ventilation simulation is not a convenience — it is a legal and operational necessity.")]),sp(60),
  p([t("The primary tool through which ventilation engineers design, analyse, and optimise underground ventilation systems is simulation software. These tools model the underground airway network as a system of branches and nodes, solve for airflow distribution using iterative or analytical methods, and increasingly incorporate psychrometric simulation to model thermal conditions. In South Africa, the standard commercial tools used for this purpose are Ventsim Design (Howden Group, 2024), VentGraph (Wentworth, 2023), and VUMAnetwork (BBE Group, 2022).")]),sp(60),
  p([t("The fundamental problem motivating this project is that commercial ventilation simulation software is priced in US Dollars at between USD 2,500 and USD 15,000 for an initial licence, with recurring annual maintenance fees. At current Rand exchange rates, this cost places professional ventilation simulation tools entirely beyond the capital budgets of small-scale and junior mining operations — enterprises that are legally obligated to maintain safe underground environments but cannot afford the tools required to design and verify them.")]),sp(60),
  p([t("The consequence is sector-wide. Small-scale mining operations in South Africa rely on manual psychrometric calculations that are too slow, too error-prone, and too static for dynamic underground conditions, or they go without simulation capability entirely. Neither approach is acceptable given the legislative requirements of the Mine Health and Safety Act and the increasing depth and thermal demands of South African mineral deposits.")]),
);
add(h2("1.2  Research Gap"));
add(
  p([t("A review of the existing literature and commercial product landscape identifies three specific gaps that this project addresses:")]),sp(40),
  num_("No accessible, affordable ventilation simulation tool exists for the small-scale and junior mining sector in South Africa. VUMAnetwork was announced as free in 2021 but requires a licence key and quotation request at time of research, maintaining a cost barrier."),
  num_("No current commercial ventilation tool provides stope-scale spatial resolution. All tools model stopes as lumped network branches. There is no tool that simulates the spatial distribution of airflow, temperature, and dust concentration within the stope geometry."),
  num_("No current commercial ventilation tool uses agent-based modelling for contaminant transport. All existing tools use advection-diffusion PDEs that introduce spurious numerical diffusion proportional to O(h|v|), smearing concentration gradients across ventilation control boundaries."),sp(40),
);
add(h2("1.3  Research Aim and Objectives"));
add(
  p([t("The aim of this project is to design, develop, and validate an accessible, low-cost mine ventilation simulation software specifically configured for the operational and financial reality of small-scale and junior underground mining operations in South Africa.")]),sp(40),
  p([tb("Objective O1: ",{color:C.blue}),t("Design and implement a network-level ventilation solver that correctly applies the Atkinson equation for pressure loss and conserves mass flow at all network nodes, verified against manual calculation.")]),
  p([tb("Objective O2: ",{color:C.blue}),t("Design and implement a 3D stope-scale cellular solver that resolves spatial distribution of airflow, temperature, and dust concentration within the stope geometry.")]),
  p([tb("Objective O3: ",{color:C.blue}),t("Design and implement a psychrometric engine that conserves sigma heat and moisture content at mixing nodes and correctly propagates air state through the ventilation network.")]),
  p([tb("Objective O4: ",{color:C.blue}),t("Implement fan curve analysis including density correction, affinity law scaling, series and parallel fan combinations, and operating point determination.")]),
  p([tb("Objective O5: ",{color:C.blue}),t("Validate all implemented modules against manual calculations, reference spreadsheet data, and commercial tool outputs where available.")]),
  p([tb("Objective O6: ",{color:C.blue}),t("Demonstrate that the platform produces compliance-ready ventilation reports in the format used by South African mine ventilation officers.")]),sp(40),
);
add(h2("1.4  Scope and Limitations"));
add(
  p([t("The scope of this project is limited to conventional underground mining methods applicable to small-scale and medium-scale South African operations: bord-and-pillar coal mining and conventional narrow reef stoping for gold and platinum. Caving methods are excluded because the ventilation physics of draw columns is fundamentally different from conventional methods.")]),sp(40),
  p([t("Explicitly excluded from the current implementation: cooling towers and water reticulation, noise propagation modelling, production planning integration, and caving method ventilation. These exclusions were made on the basis that they are either not relevant to the target market or constitute separate research projects of comparable scope.")]),sp(40),
  p([t("The psychrometric engine and thermal model are implemented at a level appropriate for validation against reference data but have not yet been fully integrated into the network solver coupling loop. This limitation is documented in detail in Chapter 11.")]),sp(40),
);
add(h2("1.5  Report Structure"));
add(
  p([t("Chapter 2 presents the literature review. Chapter 3 describes the software architecture. Chapter 4 documents the core network solver. Chapter 5 covers the psychrometric engine. Chapter 6 documents the 3D stope cellular solver. Chapter 7 covers the dust ABM. Chapter 8 presents fan curve analysis. Chapter 9 describes the compliance report generator. Chapter 10 presents validation results. Chapter 11 identifies outstanding gaps and the development roadmap. Chapter 12 presents conclusions.")]),
  new Paragraph({children:[new PageBreak()]}),
);

// ── CH2 LITERATURE REVIEW ─────────────────────────────────────────────────
add(h1("Chapter 2:  Literature Review"));
add(h2("2.1  Fundamental Principles of Mine Ventilation"));
add(h3("2.1.1  The Atkinson Equation"));
add(
  p([t("The theoretical foundation of mine ventilation network analysis is the Atkinson equation, first derived by Atkinson (1854) and remaining the universally accepted standard for frictional pressure loss in mine airways. The equation relates pressure loss to volumetric airflow through the airway resistance:")]),sp(40),
  eq("ΔP  =  R · Q · |Q|  =  k · C · L / A³  ·  Q · |Q|"),
  p([t("where R is the Atkinson resistance (Ns²/m⁸), k is the Atkinson friction factor (Ns²/m⁴), C is the perimeter (m), L is the length (m), A is the cross-sectional area (m²), and Q is the volumetric flow rate (m³/s). The signed form Q·|Q| preserves flow direction for network solvers that must handle reversals. The relationship between the Atkinson friction factor k and the Darcy-Weisbach friction factor f is:")]),sp(40),
  eq("k  =  f · ρ_ref / 8  =  0.15 f     (at ρ_ref = 1.2 kg/m³)"),
  p([t("McPherson (1993) provides comprehensive treatment of the Atkinson equation and its derivation from the Darcy-Weisbach equation. Hartman et al. (1997) present application to mine network analysis. The SANS 9998 ventilation standard (SABS, 2018) prescribes survey methodology for determining k values in South African underground mines.")]),sp(60),
);
add(h3("2.1.2  Reynolds Number and Flow Regime"));
add(
  p([t("The flow regime in mine airways is characterised by the Reynolds number Re = ρVD_h/μ. For a standard 3.0 × 3.0 m development tunnel carrying Q = 27 m³/s (V = 3.0 m/s, D_h = 3.0 m):")]),sp(40),
  eq("Re  =  (1.2 × 3.0 × 3.0) / (1.81 × 10⁻⁵)  =  5.97 × 10⁵"),
  p([t("This value is firmly in the fully turbulent rough regime (Re >> 4,000), confirming that mine ventilation flows are always turbulent and that the friction factor is independent of Reynolds number. This is a universal finding in the ventilation literature (McPherson, 1993) and validates the use of a constant k value for each airway in the Atkinson equation regardless of the instantaneous flow rate. In the ASM Lab platform, Reynolds number is displayed per airway as a diagnostic indicator — a capability not found in any current commercial tool.")]),sp(60),
);
add(h3("2.1.3  Kirchhoff's Laws and Network Solution"));
add(
  p([t("Mine ventilation networks are solved by applying the fluid mechanics equivalents of Kirchhoff's circuit laws. The first law (node continuity):")]),sp(40),
  eq("Σ Q_in  =  Σ Q_out     (volumetric)     or     Σ ṁ_in  =  Σ ṁ_out     (mass flow)"),
  p([t("The second law (mesh balance):")]),sp(40),
  eq("Σ R_i · Q_i · |Q_i|  =  0     (around any closed loop)"),
  p([t("These conditions applied across all nodes and loops define a system of nonlinear equations that must be solved iteratively. Hardy Cross (1936) developed the standard iterative correction method that remains the basis of most commercial ventilation solvers. The ASM Lab solver uses graph reduction as a pre-processing step to reduce the problem size before the Hardy Cross residual solve, as discussed in Chapter 4.")]),sp(60),
);
add(h2("2.2  Psychrometrics in Mine Ventilation"));
add(h3("2.2.1  Legislative Context"));
add(
  p([t("The Mine Health and Safety Act (No. 29 of 1996) prescribes thermal limits that require psychrometric simulation for compliance assessment. The critical thresholds are 27.5°C wet bulb (WB), below which no additional heat protection measures are required; 32.5°C WB (hard legislative ceiling, production must cease); and 37.8°C dry bulb (DB) as a secondary limit. Additionally, the Act requires heat screening and heat tolerance testing for workers above 27.5°C WB, risk assessment documentation, and shift utilisation analysis in hot environments.")]),sp(40),
  p([t("These requirements make psychrometric simulation not an optional feature but a compliance tool. Accurate wet bulb temperature prediction at working faces is the primary thermal output that mine management and the DMRE inspectorate require.")]),sp(60),
);
add(h3("2.2.2  The McPherson Framework"));
add(
  p([t("McPherson (1993) established that the correct conserved quantity at mixing nodes is sigma heat S, not temperature. Sigma heat is defined as:")]),sp(40),
  eq("S  =  L_w · X_s  +  1005 · t_w     (kJ/kg dry air)"),
  p([t("where L_w = (2502.5 − 2.386·t_w) × 1000 J/kg is the latent heat at the wet bulb temperature t_w, and X_s is the saturation moisture content. Direct temperature averaging at mixing nodes violates the first law of thermodynamics. This is the single most common error in simplified ventilation simulation tools and is explicitly avoided in the ASM Lab implementation.")]),sp(40),
  p([t("Auto-compression — the adiabatic heating of air as it descends — adds approximately 0.00975°C per metre of descent. This must be applied before any other heat source calculation because it changes the reference temperature that all subsequent heat transfer calculations use:")]),sp(40),
  eq("Δt_d  =  0.00975 · Δz     (°C per metre of descent, z positive downward)"),
  sp(60),
);
add(h2("2.3  Current Commercial Software"));
add(h3("2.3.1  Ventsim Design"));
add(p([t("Ventsim Design (Howden Group, 2024) is the most widely used mine ventilation simulation tool globally. It provides three-dimensional network modelling, heat and gas simulation, fire scenario analysis, and Ventilation-on-Demand automation. Licensing costs range from approximately USD 5,000 to USD 15,000 for the initial licence, with USD 800–1,300 annual maintenance. At current Rand exchange rates, this represents R95,000–R285,000 for the initial licence alone — a cost that exceeds the monthly operating budget of most small-scale South African mines.")]),sp(40));
add(h3("2.3.2  VentGraph"));
add(p([t("VentGraph (Wentworth, 2023) is a ventilation network analysis tool developed in Poland and widely used in European and South American mining. It provides steady-state and quasi-transient airflow simulation, heat analysis, and fire and methane modelling. It is marketed at institutional level with pricing in a similar inaccessibility tier for small-scale operators.")]),sp(40));
add(h3("2.3.3  VUMAnetwork and the Free Access Question"));
add(
  p([t("VUMAnetwork (BBE Group, 2022) was announced as free in 2021 by Crown Publications: 'the full version of VUMAnetwork is available at no cost.' This claim was widely cited in South African ventilation literature. However, at the time of this research (2026), VUMAnetwork 5.0 requires users to request a quotation and obtain a licence key through direct contact with BBE support. The product page was last updated October 2023 without correction of the free-access claim.")]),sp(40),
  p([t("This discovery — that the most cited accessible tool is not actually accessible without institutional contact — is a significant finding. It means the accessibility gap for small-scale mines is larger than the literature suggests, and the motivation for an open, independently accessible tool is stronger.")]),sp(60),
);
add(h2("2.4  Research Gaps and Novel Contributions"));
add(
  p([tb("Gap 1 — Accessibility: ",{color:C.red}),t("No genuinely accessible, low-cost ventilation simulation tool exists for the small-scale and junior mining sector in South Africa.")]),sp(40),
  p([tb("Gap 2 — Stope-scale resolution: ",{color:C.red}),t("All commercial tools model the stope as a lumped network branch. No tool provides spatial resolution of airflow, temperature, or dust within the stope geometry.")]),sp(40),
  p([tb("Gap 3 — Contaminant transport accuracy: ",{color:C.red}),t("Commercial tools use advection-diffusion PDEs introducing spurious numerical diffusion O(h|v|), smearing concentration gradients across ventilation control boundaries in a physically unrealistic way.")]),sp(40),
  p([t("The ASM Lab platform addresses all three gaps. The novel computational contributions are: (1) a graph reduction solver architecture not used in any commercial tool; (2) a HR-DPCNS stope cellular solver providing spatial stope resolution; and (3) an agent-based dust transport model with a provable anti-diffusion guarantee reducing spurious diffusion from O(h|v|) to O(h²|∇v|).")]),
  new Paragraph({children:[new PageBreak()]}),
);

// ── CH3 ARCHITECTURE ───────────────────────────────────────────────────────
add(h1("Chapter 3:  Software Architecture and Design"));
add(h2("3.1  Technology Stack"));
add(
  p([t("The ASM Lab platform is implemented as a native desktop application using PySide6 (the official Python bindings for the Qt6 framework) on a Python 3.10+ backend. This choice was made for several reasons: PySide6 provides direct GPU access through QOpenGLWidget for 3D rendering; native Qt file dialogs provide a professional user experience for import/export; the Python ecosystem provides necessary scientific libraries (NumPy, SciPy) and report generation tools (ReportLab, WeasyPrint); and the application runs without a browser, web server, or internet connection — critical for underground mine environments.")]),sp(40),
  p([t("The stope simulator component is implemented as a TypeScript/React application using the Lovable development platform, allowing faster UI iteration on the stope grid editor and 3D viewport. The stope simulator communicates with the PySide6 application through a well-defined JSON interface.")]),sp(60),
);
add(h2("3.2  Module Architecture and Interface Contract"));
add(
  p([t("The platform is organised into independent compute modules communicating through defined interfaces. The most important architectural decision is the strict separation between the network solver and the psychrometric engine, which communicate through exactly two quantities per airway:")]),sp(40),
  box("Engine Interface Contract — Inviolable",C.teal,"EAF5F5",[
    pc([tb("Solver → Psychrometrics: ",{color:C.teal}),t("mass flow ṁ (kg/s) per airway and flow direction (upstream/downstream).")]),
    pc([tb("Psychrometrics → Solver: ",{color:C.teal}),t("density ρ (kg/m³) per airway.")]),
    pc([tb("Nothing else: ",{color:C.teal}),t("the solver never sees temperatures or humidity. The psychrometric engine never sees network topology. Each module is independently testable and replaceable.")]),
  ]),
  sp(60),
);

module.exports = { children };