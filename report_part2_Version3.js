'use strict';
const {W,C,borders,pad,padS,t,tb,ti,tm,p,pc,h1,h2,h3,sp,eq,bul,num_,divider,figNote,tabNote,figPH,hc,dc,mc,box,ref_} = require('./report_helpers');
const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle,
        WidthType, ShadingType, LevelFormat, PageBreak, VerticalAlign, HeadingLevel } = require('docx');

const children = [];
const add = (...items) => children.push(...items);

// ═══════════════════════════════════════════════════════════════
// CH4: NETWORK SOLVER
// ═══════════════════════════════════════════════════════════════
add(h1("Chapter 4:  Network Ventilation Solver"));

add(h2("4.1  Graph Reduction Architecture"));
add(
  p([t("The primary innovation of the ASM Lab network solver is its graph reduction architecture. Rather than applying an iterative method to the entire network, the solver first analytically reduces as much of the network as possible through series and parallel simplification, then applies iterative treatment only to the irreducible residual mesh. This exploits the observation that most mine networks are largely reducible — they contain series chains connecting working faces to main airways, and parallel splits around pillars and ventilation controls.")]),sp(40),
  p([t("The reduction proceeds in three passes repeated until stable: (1) dead-end pruning — airways connecting to single-connection nodes carry zero flow and are removed; (2) series reduction — chains of nodes with no branches at intermediate nodes are collapsed to a single equivalent airway; (3) parallel reduction — pairs of airways sharing the same from-node and to-node are collapsed to a single equivalent airway. Each reduction preserves edge ancestry through a registry and expansion function, allowing individual airway flows to be recovered after the solve.")]),sp(40),
  p([t("This architecture is not used in any current commercial ventilation tool. Commercial tools apply iterative methods (Hardy Cross or nodal Laplacian) to the entire network regardless of how much of it is analytically solvable. The graph reduction approach is both faster and numerically superior — it reduces the condition number of the residual system by removing the well-conditioned portions analytically.")]),sp(60),
);

add(h2("4.2  Series and Parallel Reduction"));
add(h3("4.2.1  Volumetric Form (Incompressible)"));
add(
  p([t("In the volumetric incompressible form, series airways carry the same flow Q. The equivalent resistance is:"), ]),sp(40),
  eq("R_eq_series  =  R₁  +  R₂  +  R₃  +  …"),
  p([t("For parallel airways sharing the same nodes, the equivalent resistance is:")]),sp(40),
  eq("1 / √R_eq_parallel  =  1/√R₁  +  1/√R₂"),
  p([t("These follow directly from ΔP = R·Q² applied to series (same Q) and parallel (same ΔP) conditions.")]),sp(60),
);
add(h3("4.2.2  Mass Flow Form (Compressible — Required When ρ Varies)"));
add(
  p([t("When the psychrometric engine is active, density varies between airways. The conserved quantity at each node is mass flow ṁ = ρQ, not volumetric flow Q. The Atkinson equation in mass flow form is:")]),sp(40),
  eq("ΔP  =  (R/ρ²) · ṁ · |ṁ|"),
  p([t("The series and parallel reduction formulas change accordingly:")]),sp(40),
  eq("R_eq_series  =  R₁/ρ₁²  +  R₂/ρ₂²  +  R₃/ρ₃²"),
  eq("1/√R_eq_parallel  =  ρ₁/√R₁  +  ρ₂/√R₂"),
  p([t("The Hardy Cross loop correction in mass flow form:")]),sp(40),
  eq("Δṁ  =  −Σ(Rᵢ · ṁᵢ · |ṁᵢ| / ρᵢ²)  /  Σ(2Rᵢ · |ṁᵢ| / ρᵢ²)"),
  p([t("The mass flow rewrite is the primary outstanding development item (Issue O01). The current solver correctly implements the volumetric form, which is equivalent to the mass flow form when ρ = 1.2 kg/m³ everywhere (incompressible mode).")]),sp(60),
);

add(h2("4.3  Residual Mesh Solver — Nodal Pressure Laplacian"));
add(
  p([t("Network sections that cannot be reduced by series/parallel elimination are solved by a nodal pressure Laplacian solver. The Picard conductance linearises the nonlinear Atkinson equation:")]),sp(40),
  eq("G_ij  =  ρ²  /  (R · max(|ṁ|, ε))     (ε = 10⁻⁴ kg/s floor)"),
  p([t("The symmetric pressure Laplacian system:")]),sp(40),
  eq("Σ_j G_ij · (P_i − P_j)  =  0     ∀ interior nodes i"),
  p([t("is solved with Dirichlet boundaries P[intake] = P_in and P[exhaust] = 0 using Successive Over-Relaxation:")]),sp(40),
  eq("P_i^new  =  (1−ω)·P_i^old  +  ω · (Σ G_ij · P_j) / (Σ G_ij)"),
  p([t("Convergence is declared when the L2 residual satisfies:")]),sp(40),
  eq("L2_residual  =  √(Σ R_i² / N)  <  ε_tol     (ε_tol = 10⁻⁵ Pa recommended)"),
  p([t("The recommended SOR parameter is ω = 1.5–1.7. The theoretical optimum ω_opt = 2/(1 + √(1−ρ²_J)) depends on the spectral radius of the Jacobi iteration matrix, which is not trivially computable for arbitrary user-painted networks. A fixed ω = 1.5 is used as a conservative default.")]),sp(60),
);

add(h2("4.4  Fan Integration in the Solver"));
add(
  p([t("For a fan on airway (i→j) adding pressure ΔP_fan, the fan contributes a source term to the SOR update. At node i connected to j via a fan:")]),sp(40),
  eq("num  +=  G_ij × (P_j  +  ΔP_fan(Q_ij))     (fan from j to i)"),
  eq("num  +=  G_ij × (P_j  −  ΔP_fan(Q_ij))     (fan from i to j)"),
  p([t("In the current implementation, ΔP_fan is a user-specified constant (fixed pressure mode). The fan curve module (Chapter 8) extends this to evaluate ΔP_fan from a P-Q curve at the current operating flow, requiring an outer Newton iteration around the solver loop to find the consistent operating point.")]),sp(60),
);

add(h2("4.5  Natural Ventilation Pressure"));
add(
  p([t("Natural ventilation pressure (NVP) arises from density differences between intake and return airways at different elevations. For a column of air of height Δz with density ρ:")]),sp(40),
  eq("NVP  =  g · Σ (ρᵢ · Δzᵢ)     (Pa)"),
  p([t("NVP is already implemented and working in the ASM Lab solver. The elevation data is carried per node, and density is supplied by the psychrometric engine per airway. NVP contributes to the pressure balance in the same way as a fan — it is a source term at each vertical airway in the Laplacian system.")]),
  new Paragraph({children:[new PageBreak()]}),
);

// ═══════════════════════════════════════════════════════════════
// CH5: PSYCHROMETRIC ENGINE
// ═══════════════════════════════════════════════════════════════
add(h1("Chapter 5:  Psychrometric Engine"));

add(h2("5.1  Design Philosophy"));
add(
  p([t("The psychrometric engine is a modular layer that operates between network solver passes. It takes mass flow and flow direction from the solver, marches an AirState through the network from intake to exhaust, applies heat and moisture sources per airway, mixes states at junctions, and returns updated densities to the solver. The fundamental constraint is:")]),sp(40),
  box("Conservation Rule — Non-Negotiable",C.red,"FCE4D6",[
    pc([tb("NEVER: ",{color:C.red}),t("T_mix = Σ(Q_i·T_i) / Σ Q_i  ← temperature averaging, violates first law")]),
    pc([tb("CORRECT: ",{color:C.red}),t("S_mix = Σ(ṁᵢ·Sᵢ) / Σ ṁᵢ  ← sigma heat conservation")]),
    pc([tb("CORRECT: ",{color:C.red}),t("X_mix = Σ(ṁᵢ·Xᵢ) / Σ ṁᵢ  ← moisture content conservation")]),
    pc([t("Recover t_w and t_d from S_mix and X_mix using Newton iteration.")]),
  ]),
  sp(60),
);

add(h2("5.2  Core Equations"));
add(
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[3800,5560],rows:[
    new TableRow({children:[hc("Equation",C.teal,3800),hc("Description",C.teal,5560)]}),
    ...[
      ["e_sw = 0.6106·exp(17.27·t_w / (237.3+t_w))","Saturation vapour pressure (kPa) — Magnus approximation"],
      ["e = e_sw − 6.60×10⁻⁴·P·(t_d − t_w)","Actual vapour pressure — Sprung formula, aspirated instrument (A = 6.60×10⁻⁴ K⁻¹)"],
      ["X = 0.622·e / (P − e)","Moisture content (kg water / kg dry air)"],
      ["X_s = 0.622·e_sw / (P − e_sw)","Saturation moisture content"],
      ["L_w = (2502.5 − 2.386·t_w) × 1000","Latent heat at wet bulb (J/kg)"],
      ["S = L_w·X_s + 1005·t_w","Sigma heat (kJ/kg) — CONSERVED at mixing nodes"],
      ["H = 1005·t_d + X·(2501000 + 1884·t_d)","Enthalpy (J/kg dry air)"],
      ["ρ = (P − 0.378·e)×1000 / (287.04·(t_d+273.15))","Actual density (kg/m³) — USE for solver density correction"],
      ["ρ_app = (P − e)×1000 / (287.04·(t_d+273.15))","Apparent density — for NVP calculation"],
      ["Δt_d = 0.00975·Δz","Auto-compression (°C/m descent) — apply FIRST per airway"],
    ].map(([eq_,desc],i)=>new TableRow({children:[mc(eq_,3800,i%2?"F0F4FA":"FAFAFA"),dc(desc,5560,i%2?"F9FAFB":"FFFFFF")]}))
  ]}),
  tabNote("5.1","Complete psychrometric equation set (McPherson, 1993 framework). All pressures kPa, temperatures °C."),sp(60),
);

add(h2("5.3  Wet Bulb Recovery: fromSXP Newton Solver"));
add(
  p([t("After mixing, S_mixed and X_mixed are known but t_w is not. Recovery requires solving:")]),sp(40),
  eq("f(t_w)  =  L_w(t_w)·X_s(t_w)  +  1005·t_w  −  S  =  0"),
  eq("f'(t_w)  =  L_w·dX_s/dt_w  +  1005     where  dX_s/dt_w ≈ X_s·17.27·237.3 / (237.3+t_w)²"),
  eq("t_w ← t_w  −  f(t_w) / f'(t_w)     (Newton iteration, converges in 3–5 steps)"),
  p([t("Convergence declared when |f(t_w)| < 10⁻⁶. Dry bulb recovered via: t_d = t_w + (e_sw − e) / (A·P), where e = X·P / (0.622 + X).")]),sp(60),
);

add(h2("5.4  Heat Source Application Order"));
add(
  p([t("Heat sources must be applied in a specific order per airway. Auto-compression must always be first because it changes the reference temperature that all subsequent heat transfer calculations use.")]),sp(40),
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[500,1800,3400,3660],rows:[
    new TableRow({children:[hc("Step",C.orange,500),hc("Source",C.orange,1800),hc("Formula",C.orange,3400),hc("Notes",C.orange,3660)]}),
    ...[
      ["1","Auto-compression","Δt_d = 0.00975·Δz·sin(dip); S unchanged","ALWAYS FIRST. Not just at face cells — all vertical airways."],
      ["2","Rock heat","ΔS = h·C·L·(T_VRT−t_d) / ṁ","h = heat transfer coeff (W/m²K). T_VRT = virgin rock temp. User supplied."],
      ["3","Water evaporation","X_out = (ṁ·X_in + ṁ_water) / (ṁ + ṁ_water)","Fissure water or wet surfaces. Optional."],
      ["4","Equipment heat","ΔS = Q_kW × 1000 / ṁ","All diesel + electric machinery. X unchanged."],
      ["5","Cooling systems","ΔS = −Duty_kW × 1000 / ṁ","BAC, spray chambers, fridge coils. Always last."],
    ].map(([s,src,f,n],i)=>new TableRow({children:[dc(s,500,i%2?"FCE9D9":"FFF0E8",true,C.orange),dc(src,1800,i%2?"F9FAFB":"FFFFFF",true,C.grey),mc(f,3400),dc(n,3660,i%2?"F9FAFB":"FFFFFF",false,C.teal)]}))
  ]}),
  tabNote("5.2","Heat source application order per airway. Order is mandatory."),sp(60),
);

add(h2("5.5  Outer Coupling Loop"));
add(
  p([t("The solver and psychrometric engine are coupled through an outer iteration loop. Density affects resistance which affects flow which affects mixing which affects density. A single pass gives wrong results whenever density is non-uniform.")]),sp(40),
  box("Outer Coupling Loop — Required Implementation",C.navy,C.bgBlue,[
    num_("Initialise all airway densities ρ = 1.2 kg/m³. All node AirStates from intake boundary."),
    num_("Run mass-flow solver → ṁ per airway + flow direction."),
    num_("Determine upstream/downstream per airway from sign of ṁ. Never assume fixed direction."),
    num_("March AirState through network: apply heat sources in order (Table 5.2) per airway."),
    num_("Mix states at each node: mass-weighted S and X → fromSXP Newton → full AirState."),
    num_("Update density: ρ_new per airway from psychrometric output."),
    num_("Apply relaxation: ρ = 0.7·ρ_new + 0.3·ρ_old (damps oscillation in high-gradient cases)."),
    num_("Check: max|ρ_new − ρ_old| / ρ_old < 10⁻⁴. If not converged, go to step 2."),
  ]),
  sp(60),
);

add(h2("5.6  Validation Reference Cases"));
add(
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[2000,1100,1100,1100,1200,1200,1300,1360],rows:[
    new TableRow({children:[hc("Case",C.teal,2000),hc("P (kPa)",C.teal,1100),hc("t_w (°C)",C.teal,1100),hc("t_d (°C)",C.teal,1100),hc("ρ (kg/m³)",C.teal,1200),hc("S (kJ/kg)",C.teal,1200),hc("H (kJ/kg)",C.teal,1300),hc("Status",C.teal,1360)]}),
    ...[
      ["Duty 1 — Intake","118.0","18.0","32.0","1.3431","45.350","45.750","[INSERT]"],
      ["Duty 1 — Return","118.0","18.0","23.0","1.3808","45.319","45.996","[INSERT]"],
      ["Duty 2 — Air In","112.7","29.5","31.0","1.2737","87.028","89.859","[INSERT]"],
      ["Duty 2 — Air Out","112.7","23.5","27.0","1.2967","63.710","65.176","[INSERT]"],
    ].map(([c,p_,tw,td,rho,s,h_,st],i)=>new TableRow({children:[dc(c,2000,i%2?"F9FAFB":"FFFFFF",true,C.grey),mc(p_,1100),mc(tw,1100),mc(td,1100),mc(rho,1200),mc(s,1200),mc(h_,1300),dc(st,1360,C.bgYellow,true,C.orange,AlignmentType.CENTER)]}))
  ]}),
  tabNote("5.3","Validation cases from Vent_Calcs_V16 reference spreadsheet (Psychometry sheet). INSERT = software output required."),
  new Paragraph({children:[new PageBreak()]}),
);

// ═══════════════════════════════════════════════════════════════
// CH6: 3D STOPE SOLVER
// ═══════════════════════════════════════════════════════════════
add(h1("Chapter 6:  3D Stope Cellular Solver — HR-DPCNS"));

add(h2("6.1  Classification"));
add(
  p([t("The stope simulator implements a High-Resolution Distributed Parameter Cellular Network Solver (HR-DPCNS). This is neither a lumped network model nor a CFD solver in the traditional Navier-Stokes sense. The classification requires justification.")]),sp(40),
  p([t("A lumped network model represents a stope as a single branch — no spatial resolution. A Navier-Stokes CFD solver resolves momentum, turbulence, and pressure-velocity coupling — powerful but computationally intensive and requires turbulence closure that is not validated for mine stope geometries.")]),sp(40),
  p([t("The HR-DPCNS approach exploits that mine stope flow is strongly geometry-constrained. In a narrow reef stope (1.2m hanging wall to footwall), air enters at the gully and must reach the face through a highly constrained path. The dominant physics is pressure-driven flow through a resistive medium — Darcy flow. The momentum equation contributes less than 5% to the total pressure distribution for the Reynolds numbers and velocities typical of stope ventilation. This is the physical justification for the Darcy formulation.")]),sp(60),
);

add(h2("6.2  Pressure-Poisson Formulation"));
add(
  p([t("The stope is modelled as a porous medium with spatially varying conductivity K = 1/RESISTANCE[cell_type]. The pressure field satisfies:")]),sp(40),
  eq("∇·(K ∇P)  =  0"),
  p([t("with Dirichlet BCs: P = P_in on permeable intake cells (x = 0), P = 0 on permeable exhaust cells (x = nx−1). All other boundaries are Neumann (no-flux) automatically enforced by the harmonic mean face conductivity:")]),sp(40),
  eq("K_face  =  2·K_A·K_B / (K_A + K_B)"),
  p([t("When either adjacent cell is solid (K = 0), the harmonic mean gives K_face = 0, enforcing zero flux across the solid boundary without explicit boundary condition handling. This is the key advantage of the harmonic mean over the arithmetic mean for solid-fluid interface treatment.")]),sp(60),
);

add(h2("6.3  Red-Black SOR Solver"));
add(
  p([t("The pressure Poisson equation is solved on the 3D voxel grid using Red-Black SOR. Red cells (x+y+z even) are updated in the first pass; black cells (x+y+z odd) in the second pass. The SOR update for interior node (x,y,z):")]),sp(40),
  eq("P^new  =  (1−ω)·P^old  +  ω · (Σ K_face · P_neighbour) / (Σ K_face)"),
  p([t("with ω ≈ 1.7. The inner loop iterates over x fastest (matching the memory layout i = (z·ny+y)·nx+x) to maximise cache locality. Iteration terminates when the L∞ pressure residual falls below 10⁻⁵ Pa, with a convergence warning if the maximum iteration limit is reached without convergence.")]),sp(60),
);

add(h2("6.4  Velocity Field"));
add(
  p([t("Cell-centred velocities are recovered from the pressure field using central differences:")]),sp(40),
  eq("v_x(i,j,k)  =  −K(i,j,k) · (P_{i+1,j,k} − P_{i−1,j,k}) / (2·Δx)"),
  p([t("with one-sided differences at solid-adjacent cells and domain boundaries. The three velocity components vx, vy, vz are computed identically for y and z directions.")]),sp(60),
);

add(h2("6.5  3D Data Model"));
add(
  p([t("The 3D volume has dimensions nx × ny × nz. Linear index: i = (z·ny + y)·nx + x (x fastest). The 3D extension added: (1) z-direction pressure-Poisson terms, (2) vz velocity component, (3) layer slider UI for editing the volume as 2D slices, (4) true-z extrusion in the 3D viewport: y_world = (z+0.5)·cellSize, (5) 3D dust particles with z position and vz velocity.")]),sp(40),
  figPH("6.1","3D stope visualiser showing the default 20 × 14 × 8 voxel stope with temperature colour overlay. Blue = cool intake, red = hot working face."),
  figNote("6.1","ASM Lab 3D stope visualiser with temperature colour overlay."),sp(60),
);

add(h2("6.6  Confirmed Bug Fixes"));
add(
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[1900,3500,3960],rows:[
    new TableRow({children:[hc("Bug",C.red,1900),hc("Effect",C.red,3500),hc("Fix Applied",C.red,3960)]}),
    ...[
      ["Auto-compression proxy","1500m depth proxy → fictitious 15°C temperature spike in horizontal stopes.","Δz_ab = h·sin(θ_ab) per edge. Proxy restricted to barometric pressure init only."],
      ["Fixed psychrometric march","4-pass loop stalled on recirculation pockets — information did not propagate.","Adaptive while-loop: repeat until ΔS_max < 0.01 kJ/kg. Max 50 passes."],
      ["Gauss-Seidel stalling","Fixed 200-iter cap exited before convergence at 1200× resistance contrast.","SOR ω = 1.7 + L∞ convergence check. Warning generated if not converged."],
      ["First-order velocity splat","O(h|v|) spurious diffusion smeared dust across brattice edges non-physically.","Trilinear face-flux interpolation. D_num reduced from O(h|v|) to O(h²|∇v|)."],
    ].map(([b,e,f],i)=>new TableRow({children:[dc(b,1900,i%2?"FCE4D6":"FFF0EE",true,C.red),dc(e,3500,i%2?"F9FAFB":"FFFFFF"),dc(f,3960,i%2?"E2EFDA":"F0FBF0",false,C.teal)]}))
  ]}),
  tabNote("6.1","Critical numerical bugs identified, their effects, and confirmed fixes."),
  new Paragraph({children:[new PageBreak()]}),
);

// ═══════════════════════════════════════════════════════════════
// CH7: DUST ABM
// ═══════════════════════════════════════════════════════════════
add(h1("Chapter 7:  Dust Agent-Based Model"));

add(h2("7.1  Motivation for Agent-Based Modelling"));
add(
  p([t("The advection-diffusion PDE approach used by commercial tools:")]),sp(40),
  eq("∂C/∂t  +  v·∇C  =  D∇²C  +  S"),
  p([t("introduces spurious numerical diffusion when solved by first-order upwind finite differences on the voxel grid. The numerical diffusion coefficient is:")]),sp(40),
  eq("D_num_first_order  =  h · |v| / 2     (first order upwind)"),
  p([t("For typical mine stope conditions (h = 0.5 m, |v| = 0.5 m/s), D_num ≈ 0.125 m²/s. The physical diffusion coefficient for mine dust in air is D_phys ≈ 10⁻⁵ to 10⁻⁴ m²/s — four to five orders of magnitude smaller. The numerical method is therefore dominated by artificial diffusion, not physical diffusion. Concentration gradients across ventilation control boundaries (brattices, curtains) are smeared over several cell widths in a way that misrepresents the actual dust distribution.")]),sp(40),
  p([t("The agent-based model avoids this by tracking individual particles through the velocity field. Particles carry no grid-scale averaging errors at boundaries — each particle follows its own trajectory determined by the local velocity at its exact position, not by an averaged cell-centre velocity.")]),sp(60),
);

add(h2("7.2  Anti-Diffusion Guarantee"));
add(
  p([t("For a particle advecting with velocity sampled by trilinear interpolation from face mass flows, the modified equation analysis gives a numerical diffusion coefficient of:")]),sp(40),
  eq("D_num_bilinear  =  O(h² · |∇v|)"),
  p([t("Comparison for representative conditions (h = 0.5 m, |v| = 0.5 m/s, |∇v| = 1.0 s⁻¹):")]),sp(40),
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[3200,2400,3760],rows:[
    new TableRow({children:[hc("Method",C.teal,3200),hc("D_num (m²/s)",C.teal,2400),hc("Physical meaning",C.teal,3760)]}),
    ...[
      ["First-order cell-centre splat","0.125","Smears 1 cell width per cell of travel. Brattice edges unresolvable."],
      ["Trilinear face-flux (this work)","0.042","3× smaller. Sharp gradients maintained near boundaries."],
      ["Physical diffusion","~10⁻⁴","Actual molecular + turbulent diffusion. Should dominate numerics."],
    ].map(([m,d,ph],i)=>new TableRow({children:[dc(m,3200,i%2?"F9FAFB":"FFFFFF",true,C.grey),mc(d,2400,i%2?"F0F4FA":"FAFAFA"),dc(ph,3760,i%2?"F9FAFB":"FFFFFF")]}))
  ]}),
  tabNote("7.1","Numerical diffusion comparison between first-order cell-centre and trilinear face-flux velocity sampling."),sp(60),
);

add(h2("7.3  Stokes Settling Velocity"));
add(
  p([t("Gravity causes dust particles to settle at the Stokes terminal velocity:")]),sp(40),
  eq("v_settle  =  (ρ_particle − ρ_air) · g · d² / (18 · μ)"),
  p([t("where ρ_particle = 2000 kg/m³ (rock dust), g = 9.81 m/s², d = particle diameter, μ = 1.81×10⁻⁵ Pa·s. For respirable dust (d ≤ 10 μm): v_settle ≈ 0.006 m/s. For inhalable dust (d ≤ 100 μm): v_settle ≈ 0.6 m/s. These values are physically correct and replace the ad-hoc 'settling rate × size factor' approach in the initial implementation.")]),sp(60),
);

add(h2("7.4  Mass Conservation of the Concentration Field"));
add(
  p([t("When a particle deposits its mass to the concentration array using trilinear weights, the weights satisfy Σ w_ijk = 1 exactly:")]),sp(40),
  eq("Σ w_ijk  =  (1−α)(1−β)(1−γ) + α(1−β)(1−γ) + … + αβγ  =  1"),
  p([t("This guarantees that the total integrated concentration Σ C_ijk·h³ equals the total particle mass injected minus the mass that has left the domain or settled, with no spurious creation or destruction.")]),
  new Paragraph({children:[new PageBreak()]}),
);

// ═══════════════════════════════════════════════════════════════
// CH8: FAN CURVES
// ═══════════════════════════════════════════════════════════════
add(h1("Chapter 8:  Fan Curve Analysis"));

add(h2("8.1  Fan Performance Characteristics"));
add(
  p([t("The performance of a mine ventilation fan is characterised by three curves at reference density ρ_ref = 1.2 kg/m³: the P-Q curve (static pressure rise versus volumetric flow rate), the W-Q curve (shaft power versus flow rate), and the η-Q curve (total-to-static efficiency versus flow rate). The best efficiency point (BEP) typically occurs at 55–70% of free-delivery flow for axial fans and 60–80% for centrifugal fans.")]),sp(40),
  figPH("8.1","Typical axial fan P-Q, W-Q, and η-Q curves showing shutoff pressure P₀, free delivery Q_f, stall region (left of stall line), BEP, and system resistance curve R·Q². Operating point at intersection of fan and system curves."),
  figNote("8.1","Typical mine auxiliary fan performance curves showing all three characteristic curves and the system resistance intersection."),sp(60),
);

add(h2("8.2  Density Correction"));
add(
  p([t("When operating at density ρ different from the reference ρ_ref = 1.2 kg/m³, the P-Q and W-Q curves scale as:")]),sp(40),
  eq("ΔP_operating  =  ΔP_reference × (ρ / ρ_ref)"),
  eq("W_operating   =  W_reference  × (ρ / ρ_ref)"),
  p([t("Volumetric flow Q is unchanged by density. For a South African deep gold mine at 38°C and BP = 115 kPa, ρ ≈ 1.06 kg/m³, so the fan pressure curve is scaled down by 1.06/1.2 = 0.88 — the fan produces only 88% of reference-condition pressure. This can shift the operating point significantly and must be accounted for in compliance calculations.")]),sp(60),
);

add(h2("8.3  Affinity Laws"));
add(
  p([t("When fan speed changes (variable speed drive, pulley change, or motor pole change), the three curves scale by the affinity laws derived from dimensional analysis (McPherson, 1993):")]),sp(40),
  eq("Q₂  =  Q₁ × (N₂/N₁)     (Fan Law 1)"),
  eq("ΔP₂ =  ΔP₁ × (N₂/N₁)²   (Fan Law 2)"),
  eq("W₂  =  W₁ × (N₂/N₁)³    (Fan Law 3)"),
  p([t("The η-Q curve is invariant under speed change — efficiency at the same point on the dimensionless performance curve is unchanged. Pulley changes are equivalent to speed changes: motor pulley increase → fan speeds up (N₂/N₁ = D_motor_new/D_motor_old); fan pulley increase → fan slows down (N₂/N₁ = D_fan_old/D_fan_new).")]),sp(60),
);

add(h2("8.4  Fans in Series"));
add(
  p([t("Two fans in series (one behind the other in the same airway) pass the same volumetric flow Q through both impellers. The combined pressure rise is the sum of both fan contributions at that flow:")]),sp(40),
  eq("ΔP_combined(Q)  =  ΔP₁(Q)  +  ΔP₂(Q)"),
  p([t("The combined P-Q curve is constructed by adding pressure values at each Q sample across the intersection of both fans' Q ranges. The series arrangement is appropriate when a single fan cannot overcome system resistance without entering the stall zone.")]),sp(60),
);

add(h2("8.5  Fans in Parallel"));
add(
  p([t("Two fans in parallel (sharing the same inlet and outlet nodes) experience the same pressure difference. The combined flow at any given pressure is the sum of both fans' flow contributions at that pressure:")]),sp(40),
  eq("Q_combined(ΔP)  =  Q₁(ΔP)  +  Q₂(ΔP)"),
  p([t("The combined curve is constructed by inverse interpolation: for each pressure level P, find Q₁ from fan 1 and Q₂ from fan 2, then sum. The parallel arrangement is appropriate when more flow is required at moderate pressure.")]),sp(40),
  p([t("The kink point — the flow at which one fan's shutoff pressure equals the operating point pressure — creates a discontinuity in the combined curve. Below the weaker fan's shutoff pressure, that fan contributes no flow. The operating point finder handles this by bracketing across the full curve including the kink.")]),sp(60),
);

add(h2("8.6  Operating Point Determination"));
add(
  p([t("The operating point satisfies f(Q) = ΔP_fan(Q) − R_sys·Q² = 0. This is solved using a Newton-bisection hybrid:")]),sp(40),
  eq("Q_Newton  =  Q_n  −  f(Q_n) / f'(Q_n)"),
  p([t("Newton's method is used when the step falls within the current bracket; bisection otherwise. This guarantees global convergence (bisection) with superlinear convergence rate near the solution (Newton). Convergence is declared when |Q_hi − Q_lo| < 10⁻⁵ m³/s.")]),sp(40),
  p([t("A non-convergent result (fan curve does not intersect system curve) indicates that the fan cannot overcome the system resistance. The solver returns the free-delivery operating point with a warning flag.")]),sp(60),
);

add(h2("8.7  Synthetic Reference Fan Library"));
add(
  p([t("The fan library uses synthetic reference curves generated from the parametric axial fan model. These replace proprietary manufacturer data (which is not available for public distribution) with physically realistic curves appropriate for academic validation. The parametric model:")]),sp(40),
  eq("P(Q)  =  P₀ · [1 − (Q/Q_f)²]     (quadratic fan law)"),
  eq("W(Q)  =  W₀  +  (W_peak−W₀) · (Q/Q_best) · exp(1 − Q/Q_best)"),
  eq("η(Q)  =  P(Q)·Q / (W(Q)·1000) · 100     (derived from P and W)"),
  p([t("where Q_best = 0.60·Q_f and W₀ is the no-load power. Twelve fans covering 5.5 kW to 75 kW and diameters 450 mm to 1200 mm were generated:")]),sp(40),
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[500,2400,1000,1000,1100,1100,1100,2160],rows:[
    new TableRow({children:[hc("ID",C.navy,500),hc("Description",C.navy,2400),hc("kW",C.navy,1000),hc("Ø mm",C.navy,1000),hc("P₀ Pa",C.navy,1100),hc("Q_f m³/s",C.navy,1100),hc("Q_stall",C.navy,1100),hc("Type",C.navy,2160)]}),
    ...[
      ["1","450mm 5.5kW 2-Pole","5.5","450","1600","3.5","0.70","Axial"],
      ["2","570mm 11kW 2-Pole","11","570","2000","5.5","1.10","Axial"],
      ["3","570mm 15kW 4-Pole","15","570","1400","7.0","1.40","Axial"],
      ["4","710mm 18.5kW 2-Pole","18.5","710","1800","8.5","1.70","Axial"],
      ["5","710mm 22kW 2-Pole","22","710","2200","10.0","2.00","Axial"],
      ["6","900mm 30kW 2-Pole","30","900","2500","14.0","2.80","Axial"],
      ["7","900mm 37kW 4-Pole","37","900","1800","18.0","3.60","Axial"],
      ["8","1000mm 45kW 2-Pole","45","1000","3000","20.0","4.00","Axial"],
      ["9","1000mm 55kW Double","55","1000","4200","22.0","4.40","Axial DS"],
      ["10","1200mm 75kW 2-Pole","75","1200","4000","30.0","6.00","Axial"],
      ["11","400mm 11kW Centrifugal","11","400","3500","3.0","0.60","Inline Centrifugal"],
      ["12","560mm 22kW Centrifugal","22","560","5000","5.5","1.10","Inline Centrifugal"],
    ].map(([id,d,kw,dia,p0,qf,qs,tp],i)=>new TableRow({children:[dc(id,500,i%2?"F9FAFB":"FFFFFF",true,C.blue),dc(d,2400,i%2?"F9FAFB":"FFFFFF"),mc(kw,1000),mc(dia,1000),mc(p0,1100),mc(qf,1100),mc(qs,1100),dc(tp,2160,i%2?"F9FAFB":"FFFFFF")]}))
  ]}),
  tabNote("8.1","Synthetic reference fan library — 12 fans, ρ_ref = 1.2 kg/m³. Synthetic curves for academic validation only — not manufacturer data."),
  new Paragraph({children:[new PageBreak()]}),
);

module.exports = { children };