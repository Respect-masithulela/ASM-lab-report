Summary of BLACKBOOK rules and implementation notes — Regulators, Boosters, Ducts/Fans

1. Regulator core equations

- Regulator purpose: restricts flow by reducing effective area; "uses up" pressure in a system, increasing system resistance and reducing flow at a given available pressure.

- Fundamental relationships:
  - P = R * Q^2  (Pressure loss across an element)
  - Series resistances: R_total = R1 + R2 + ...
  - Parallel resistances: 1/R_total = 1/R1 + 1/R2 + ...
  - Fan / system scaling: P2 = P1 * (Q2^2 / Q1^2)

- Regulator area equation (Blackbook Eq. 2.18):
  - A_r = 1.2 * Q * sqrt(rho / P)
    - A_r = regulator area (m^2)
    - Q = volumetric flow through regulator (m^3/s)
    - rho = air density (kg/m^3)
    - P = pressure used up by regulator (Pa)

- Example usage pattern (sizing):
  1. Determine system total pressure available at candidate operating point.
  2. Compute pressure required across airway to achieve desired Q (P_airway = P_ref * (Q_desired^2 / Q_ref^2)).
  3. Regulator pressure = total available pressure - P_airway.
  4. Area = 1.2 * Q_desired * sqrt(rho / P_regulator).

2. Booster fans

- Purpose: increase quantity (Q) in an airway by supplying extra pressure.
- Use P ∝ Q^2 relationship to determine required fan pressure increase:
  - P_required_at_Q2 = P_system_at_Q1 * (Q2^2 / Q1^2)
  - Booster duty (approx) = P_required_at_Q2 - P_existing_supply
- Integrate booster as an added ΔP at a network node; solver must include fan curve if accuracy required.

3. Fans in ducts / columns (key equations)

- Bernoulli-based relations for columns; fan total pressure (FTP):
  - FTP = TP2 - TP1 + p_L  (p_L = losses across fan/column)
  - FTP = FSP + FVP + p_L  (fan total pressure = fan static + fan velocity + losses)
  - FSP = FTP - FVP

- Column outlet static pressure: SP_end = 0 ; TP_end = VP_end
- Shock (entry/exit) losses and velocity pressure must be considered where diameter changes, evasee, entrances/exits.

4. Duct friction and Reynolds

- Reynolds number for duct flow: Re = rho * D * U / mu
- Friction factor and k coefficients (blackbook references spiral steel friction factor research); account for shock (entrance/exit) losses.
- Typical airway resistance formula used elsewhere in repo: R = k * C * L / A^3  (with C = perimeter, A = area)

5. Data model suggestions (JSON/JS)

- Regulator:
  {
    id: "REG-01",
    airwayId: "A08",
    position: 0.5, // fraction along airway
    area: 1.7, // m^2 (computed or set)
    status: "open" | "partial" | "closed",
    density: 1.058, // kg/m^3
    pressure_drop: 485, // Pa (pressure used by regulator)
    flow_rate: 30 // m^3/s
  }

- Duct / Column:
  {
    id: "COL-01",
    diameter: 0.76, // m
    length: 200, // m
    k: 0.02, // friction coefficient
    area: Math.PI * (D/2)**2,
    resistance: computed R (Ns^2/m^8)
  }

- Fan / Booster:
  {
    id: "FAN-01",
    type: "booster" | "force" | "exhaust",
    locationNode: "N10",
    deltaP: 60, // Pa nominal
    curve: { a:..., b:..., c:... } // optional polynomial fan curve
  }

6. Solver integration notes

- Treat a regulator as an additional resistance element localized on an airway: compute equivalent R_regulator = P_regulator / Q^2 (when P_regulator and Q known)
- When regulator state changes (area changes):
  - update R_regulator
  - recompute network (Atkinson solver / matrix solve)
  - update node pressures and airway flows
- For boosters: model as an injected ΔP at a node or as a fan element with a P(Q) curve

7. Map visualization / UI

- Render regulator as a short dash across the airway path at given position.
- Color states:
  - Closed: red dash
  - Open: blue dash
  - Partial: green dash
- Tooltip: id, flow_rate (m^3/s), pressure_drop (Pa), area (m^2), status
- Interaction: click toggles state (open ↔ closed; partial via slider)
- Scaling: dash length scales with map zoom, maintain minimum pixel size

8. Example calculations (from book)

- Sizing regulator for Q=30 m^3/s, rho=1.058 kg/m^3, P_regulator=485 Pa:
  - A = 1.2 * 30 * sqrt(1.058 / 485) ≈ 1.7 m^2

- Booster duty example pattern:
  - Given P_for_20m3s = 800 Pa; to pass 35 m^3/s: P_needed = 800 * (35^2 / 20^2) = 2450 Pa; booster must supply difference relative to existing supply.

9. Implementation checklist

- [ ] Add regulator data to airway model
- [ ] Implement computeRegulatorArea(Q,rho,P)
- [ ] Add regulator element to solver network (R_reg = P_reg / Q^2)
- [ ] Implement fan/booster as ΔP element (or fan curve)
- [ ] Visualize regulator dash with color states and tooltip

---

If you want, I can now add a JS file with calculation functions and a rendering snippet into the repo (example usage).