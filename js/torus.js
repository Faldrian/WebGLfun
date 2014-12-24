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
    var texturecoordinates = [];
    var normals = [];

    for(var iPhi = 0; iPhi <= segments; iPhi++) {
      // create new axial systems on spline
      var p0 = this.genAxialSystemFromSpline(segments, iPhi   , p, q);
      var p1 = this.genAxialSystemFromSpline(segments, iPhi +1, p, q);

      // draw ring of triangles around these two points + axes
      for(var i = 0; i < this._numRingSegments; i++) {

        // create 4 vectors for a ringsegment (2 triangles building a quad)
        var iGammaA = (i / this._numRingSegments) * 2 * Math.PI;
        var seg1a = this.genCircleVector(p0[2], p0[3], iGammaA);
        var seg2a = this.genCircleVector(p1[2], p1[3], iGammaA);

        var iGammaB = ((i +1) / this._numRingSegments) * 2 * Math.PI;
        var seg1b = this.genCircleVector(p0[2], p0[3], iGammaB);
        var seg2b = this.genCircleVector(p1[2], p1[3], iGammaB);

        vec3.scale(seg1a, seg1a, this._ringScalingFactor);
        vec3.scale(seg1b, seg1b, this._ringScalingFactor);
        vec3.scale(seg2a, seg2a, this._ringScalingFactor);
        vec3.scale(seg2b, seg2b, this._ringScalingFactor);

        // create vertices
        var vseg1a = vec3.create(),
            vseg2a = vec3.create(),
            vseg1b = vec3.create(),
            vseg2b = vec3.create();

        vec3.add(vseg1a, p0[0], seg1a);
        vec3.add(vseg2a, p1[0], seg2a);
        vec3.add(vseg1b, p0[0], seg1b);
        vec3.add(vseg2b, p1[0], seg2b);

        // add triangles to list
        this.pushVec3Triplet(vertices, vseg1a, vseg2a, vseg1b);
        this.pushVec3Triplet(vertices, vseg1b, vseg2a, vseg2b);
        
        // texture coordinates
        var y1 = (iPhi / 8) - Math.floor(iPhi / 8);
        var y2 = (iPhi / 8) - Math.floor(iPhi / 8) + 0.125;
        
        var tex1a = vec2.fromValues(i/20, y1),
  	        tex2a = vec2.fromValues(i/20, y2),
  	        tex1b = vec2.fromValues((i+1)/20, y1),
  	        tex2b = vec2.fromValues((i+1)/20, y2);
	    
  	    // add texture coodinates to list
    		this.pushVec2Triplet(texturecoordinates, tex1a, tex2a, tex1b);
    		this.pushVec2Triplet(texturecoordinates, tex1b, tex2a, tex2b);
    		
    		// add normals to list
    		this.pushVec3Triplet(normals, seg1a, seg2a, seg1b);
    		this.pushVec3Triplet(normals, seg1b, seg2a, seg2b);
      }
    }

    return [vertices, texturecoordinates, normals];
  },

/**
 * push 3 vec3 on a linear array for use with webGL
 * @param {array} out
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} c
 */
  pushVec3Triplet: function(out, a, b, c) {
    out.push(a[0], a[1], a[2],
             b[0], b[1], b[2],
             c[0], c[1], c[2]);
  },

/**
 * push 3 vec2 on a linear array for use with webGL
 * @param {array} out
 * @param {vec2} a
 * @param {vec2} b
 * @param {vec2} c
 */
  pushVec2Triplet: function(out, a, b, c) {
    out.push(a[0], a[1],
             b[0], b[1],
             c[0], c[1]);
  },

  /**
   * create a vector pointing at one part of the drawn circle
 * @param {vec3} vecx
 * @param {vec3} vecy
 * @param {float} gamma
   */
  genCircleVector: function(vecx, vecy, gamma) {
    var x = vecx[0] * Math.cos(gamma) + vecy[0] * Math.sin(gamma);
    var y = vecx[1] * Math.cos(gamma) + vecy[1] * Math.sin(gamma);
    var z = vecx[2] * Math.cos(gamma) + vecy[2] * Math.sin(gamma);

    return vec3.fromValues(x,y,z);
  },

  /**
   * creates a frenet frame for tube-drawing
 * @param {float} segments
 *    Number of total segments in spline
 * @param {float} iPhi
 *    current segment to attach frame to
 * @param {int} p
 * @param {int} q
   */
  genAxialSystemFromSpline: function(segments, iPhi, p, q) {
    var phi = (iPhi / segments) * 2 * Math.PI;
    var helpVector = vec3.fromValues(1, 1, 0);

    // get positions along the curve to get tangential vector on point
    var posBefore = this.torusCurve(p, q, phi - 0.01);
    var posAfter = this.torusCurve(p, q, phi + 0.01);

    // vectors for axial system
    var unitTangent = vec3.create();
    vec3.subtract(unitTangent, posBefore, posAfter);
    vec3.normalize(unitTangent, unitTangent);

    var unitNormal = vec3.create();
    vec3.cross(unitNormal, unitTangent, helpVector);
    vec3.normalize(unitNormal, unitNormal);

    var unitBinormal = vec3.create();
    vec3.cross(unitBinormal, unitTangent, unitNormal);
    vec3.normalize(unitBinormal, unitBinormal);

    // return Point + new axial system
    return [this.torusCurve(p, q, phi), unitTangent, unitNormal, unitBinormal];
  },

  /**
   * draws the torus curve
 * @param {int} p
 * @param {int} q
 * @param {float} phi
   */
  torusCurve: function(p, q, phi) {
    return vec3.fromValues(
      ((Math.cos(q * phi) + 2) * Math.cos(p * phi)),
      ((Math.cos(q * phi) + 2) * Math.sin(p * phi)),
      (Math.sin(q * phi))
    );
  }
};

