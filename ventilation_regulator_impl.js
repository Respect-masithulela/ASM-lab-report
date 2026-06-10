// Example helper functions for regulator, booster and simple rendering hints

function computeRegulatorArea(Q, rho, P){
  // A = 1.2 * Q * sqrt(rho / P)
  if(P <= 0) return Infinity;
  return 1.2 * Q * Math.sqrt(rho / P);
}

function computePressureFromResistance(R, Q){
  return R * Q * Q;
}

function computeResistanceFromGeometry(k, C, L, A){
  // R = k * C * L / A^3  (as used elsewhere in repo)
  if(A <= 0) return Infinity;
  return k * C * L / Math.pow(A, 3);
}

function computeRegulatorResistanceFromArea(area, Q, rho, lossCoefficient=1.0){
  // Derive regulator pressure from area using rearranged A = 1.2 * Q * sqrt(rho / P)
  // => P = rho * (1.2 * Q / A)^2
  if(area <= 0) return Infinity;
  const P = rho * Math.pow(1.2 * Q / area, 2);
  return P / (Q*Q); // R_reg = P / Q^2
}

function computeBoosterDuty(P_system_at_Q1, Q1, Q2){
  // P2 = P1 * (Q2^2 / Q1^2)
  if(Q1 <= 0) return Infinity;
  const P2 = P_system_at_Q1 * (Q2*Q2) / (Q1*Q1);
  return P2 - P_system_at_Q1;
}

// Data model factory examples
function makeRegulator(id, airwayId, position, area, status='open', density=1.058){
  return { id, airwayId, position, area, status, density, pressure_drop: null, flow_rate: null };
}

function makeFan(id, type='booster', deltaP=0){
  return { id, type, deltaP, curve: null };
}

// Simple rendering helper (pseudo-code) — integrate with your map renderer (Canvas/SVG/WebGL)
function drawRegulator(ctx, airwayPath, positionFraction, status, zoom=1){
  // airwayPath: array of [x,y] points or a path object
  // find point along path at positionFraction (0..1)
  const pt = pointAlongPath(airwayPath, positionFraction);
  const dashLength = Math.max(6, 12 * zoom);
  const color = status === 'closed' ? '#c63030' : (status === 'open' ? '#2b6ef6' : '#17a34a');

  // draw a short perpendicular dash across the airway
  const normal = pathNormalAt(airwayPath, positionFraction);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, 2 * zoom);
  ctx.beginPath();
  ctx.moveTo(pt.x - normal.x * dashLength/2, pt.y - normal.y * dashLength/2);
  ctx.lineTo(pt.x + normal.x * dashLength/2, pt.y + normal.y * dashLength/2);
  ctx.stroke();
  ctx.restore();
}

// Placeholder helpers (implement according to your map library)
function pointAlongPath(path, t){
  // naive linear interpolation along polyline
  if(!Array.isArray(path) || path.length === 0) return {x:0,y:0};
  let total = 0; const segLengths = [];
  for(let i=0;i<path.length-1;i++){ const dx = path[i+1].x-path[i].x; const dy = path[i+1].y-path[i].y; const L=Math.hypot(dx,dy); segLengths.push(L); total+=L; }
  if(total===0) return path[0];
  let target = t*total; let acc=0;
  for(let i=0;i<segLengths.length;i++){
    if(acc + segLengths[i] >= target){
      const frac = (target-acc)/segLengths[i];
      return { x: path[i].x + (path[i+1].x-path[i].x)*frac, y: path[i].y + (path[i+1].y-path[i].y)*frac };
    }
    acc += segLengths[i];
  }
  return path[path.length-1];
}

function pathNormalAt(path, t){
  // approximate tangent then return normalized perpendicular
  const p1 = pointAlongPath(path, Math.max(0, t-0.01));
  const p2 = pointAlongPath(path, Math.min(1, t+0.01));
  const dx = p2.x-p1.x; const dy = p2.y-p1.y;
  const L = Math.hypot(dx,dy)||1;
  const nx = -dy/L; const ny = dx/L; // perpendicular
  return {x:nx,y:ny};
}

module.exports = {
  computeRegulatorArea,
  computePressureFromResistance,
  computeResistanceFromGeometry,
  computeRegulatorResistanceFromArea,
  computeBoosterDuty,
  makeRegulator,
  makeFan,
  drawRegulator
};
