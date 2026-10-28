const AST = (() => {
  const rad = Math.PI/180, dayMs = 864e5, J1970 = 2440588, J2000 = 2451545, e = rad*23.4397;
  const toDays = ms => ms/dayMs - 0.5 + J1970 - J2000;
  const ra = (l, b) => Math.atan2(Math.sin(l)*Math.cos(e) - Math.tan(b)*Math.sin(e), Math.cos(l));
  const dec = (l, b) => Math.asin(Math.sin(b)*Math.cos(e) + Math.cos(b)*Math.sin(e)*Math.sin(l));
  const azimuth = (H, phi, d) => Math.atan2(Math.sin(H), Math.cos(H)*Math.sin(phi) - Math.tan(d)*Math.cos(phi));
  const altitude = (H, phi, d) => Math.asin(Math.sin(phi)*Math.sin(d) + Math.cos(phi)*Math.cos(d)*Math.cos(H));
  const sidereal = (d, lw) => rad*(280.16 + 360.9856235*d) - lw;
  const refraction = h => { if (h < 0) h = 0; return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179)); };
  function sunCoords(d){ const M = rad*(357.5291 + 0.98560028*d), C = rad*(1.9148*Math.sin(M) + 0.02*Math.sin(2*M) + 0.0003*Math.sin(3*M)), L = M + C + rad*102.9372 + Math.PI; return { dec: dec(L, 0), ra: ra(L, 0) }; }
  function moonCoords(d){ const L = rad*(218.316 + 13.176396*d), M = rad*(134.963 + 13.064993*d), F = rad*(93.272 + 13.229350*d);
    const l = L + rad*6.289*Math.sin(M), b = rad*5.128*Math.sin(F), dt = 385001 - 20905*Math.cos(M); return { ra: ra(l, b), dec: dec(l, b), dist: dt }; }
  function sun(ms, lat, lon){ const lw = rad*-lon, phi = rad*lat, d = toDays(ms), c = sunCoords(d), H = sidereal(d, lw) - c.ra; return { az: azimuth(H, phi, c.dec), alt: altitude(H, phi, c.dec) }; }
  function moon(ms, lat, lon){ const lw = rad*-lon, phi = rad*lat, d = toDays(ms), c = moonCoords(d), H = sidereal(d, lw) - c.ra; let h = altitude(H, phi, c.dec); h += refraction(h); return { az: azimuth(H, phi, c.dec), alt: h, dist: c.dist }; }
  function illum(ms){ const d = toDays(ms), s = sunCoords(d), m = moonCoords(d), sdist = 149598000;
    const phi = Math.acos(Math.sin(s.dec)*Math.sin(m.dec) + Math.cos(s.dec)*Math.cos(m.dec)*Math.cos(s.ra - m.ra));
    const inc = Math.atan2(sdist*Math.sin(phi), m.dist - sdist*Math.cos(phi));
    const angle = Math.atan2(Math.cos(s.dec)*Math.sin(s.ra - m.ra), Math.sin(s.dec)*Math.cos(m.dec) - Math.cos(s.dec)*Math.sin(m.dec)*Math.cos(s.ra - m.ra));
    return { fraction: (1 + Math.cos(inc))/2, phase: 0.5 + 0.5*inc*(angle < 0 ? -1 : 1)/Math.PI }; }
  return { sun, moon, illum, rad };
})();

export { AST };
