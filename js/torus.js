var torus = {
  _numRingSegments: 20,
  _ringScalingFactor: 0.35,

  /**
   * Creates a new list of vertices representing a torus object.
   *
   * @param {Number} segments
   * @param {Number} radius
   * @param {Number} p
   * @param {Number} q
   */
  create: function(segments, radius, p, q) {

    // DEBUG: Draw torus in line mode :)

    var vertices = [];

    for(var iPhi = 0; iPhi <= segments; iPhi++) {
      // create new axial systems on spline
      var p0 = this.genAxialSystemFromSpline(segments, iPhi   , p, q);
      var p1 = this.genAxialSystemFromSpline(segments, iPhi +1, p, q);

      // draw ring of triangles around these two points + axes
      for(var i = 0; i < this._numRingSegments; i++) {

        // create 4 vectors for a ringsegment (2 triangles building a quad)
        var iGamma = (i / this._numRingSegments) * 2 * Math.PI;
        var seg1a = this.genCircleVector(p0[2], p0[3], iGamma);
        vec3.scale(this._ringScalingFactor, seg1a);
        var seg2a = this.genCircleVector(p1[2], p1[3], iGamma);
        vec3.scale(this._ringScalingFactor, seg2a);

        iGamma = ((i +1) / this._numRingSegments) * 2 * Math.PI;
        var seg1b = this.genCircleVector(p0[2], p0[3], iGamma);  // code duplicate of above. Unrolling.
        vec3.scale(this._ringScalingFactor, seg1a);
        var seg2b = this.genCircleVector(p1[2], p1[3], iGamma);
        vec3.scale(this._ringScalingFactor, seg2a);              // end duplicate

        // create vertices
        var vseg1a = vec3.create(),
            vseg2a = vec3.create(),
            vseg1b = vec3.create(),
            vseg2b = vec3.create();

        vec3.add(vseg1a, p0[0], seg1a);
        vec3.add(vseg2a, p1[0], seg2a);
        vec3.add(vseg1b, p0[0], seg1b);
        vec3.add(vseg2b, p1[0], seg2b);

        // add triangles to vertex-list
        this.addFace(vertices, vseg1a, vseg2a, vseg1b);
        this.addFace(vertices, vseg1b, vseg2a, vseg2b);
      }
    }

    return vertices;
  },

  addFace: function(out, a, b, c) {
    out.push(a[0], a[1], a[2],
             b[0], b[1], b[2],
             c[0], c[1], c[2]);
  },

  genCircleVector: function(vecx, vecy, gamma) {
    var x = vecx[0] * Math.cos(gamma) + vecy[0] * Math.sin(gamma);
    var y = vecx[1] * Math.cos(gamma) + vecy[1] * Math.sin(gamma);
    var z = vecx[2] * Math.cos(gamma) + vecy[2] * Math.sin(gamma);

    return vec3.fromValues(x,y,z);
  },

  genAxialSystemFromSpline: function(segments, iPhi, p, q) {
    var phi = (iPhi / segments) * 2 * Math.PI;
    var helpVector = vec3.fromValues(1, 1, 0);

    // get positions along the curve to get tangential vector on point
    var posBefore = this.torusCurve(p, q, phi - 0.01);
    var posAfter = this.torusCurve(p, q, phi + 0.01);

    // vectors for axial system
    var unitTangent = vec3.create();
    vec3.subtract(unitTangent, posBefore, posAfter);

    var unitNormal = vec3.create();
    vec3.cross(unitNormal, unitTangent, helpVector);
    vec3.normalize(unitTangent, unitTangent);

    var unitBinormal = vec3.create();
    vec3.cross(unitBinormal, unitTangent, unitNormal);
    vec3.normalize(unitBinormal, unitBinormal);

    // return Point + new axial system
    return [this.torusCurve(p, q, phi), unitTangent, unitNormal, unitBinormal];
  },

  torusCurve: function(p, q, phi) {
    return vec3.fromValues(
      ((Math.cos(q * phi) + 2) * Math.cos(p * phi)),
      ((Math.cos(q * phi) + 2) * Math.sin(p * phi)),
      (Math.sin(q * phi))
    );
  }
}

