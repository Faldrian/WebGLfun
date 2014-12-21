var torus = {
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
      var phi1 = (iPhi / 200.0) * 2.0 * Math.PI;
      var vecTorusPoint = this.torusCurve(p, q, phi1);

      vertices.push(vecTorusPoint[0], vecTorusPoint[1], vecTorusPoint[2]);
    }

    return vertices;
  },

  genCircleVector: function(vecx, vecy, gamma) {
    var x = vecx[0] * Math.cos(gamma) + vecy[0] * Math.sin(gamma);
    var y = vecx[1] * Math.cos(gamma) + vecy[1] * Math.sin(gamma);
    var z = vecx[2] * Math.cos(gamma) + vecy[2] * Math.sin(gamma);

    return vec3.fromValues(x,y,z);
  },

  torusCurve: function(p, q, phi) {
    return vec3.fromValues(
      ((Math.cos(q * phi) + 2) * Math.cos(p * phi)),
      ((Math.cos(q * phi) + 2) * Math.sin(p * phi)),
      (Math.sin(q * phi))
    );
  }
}

